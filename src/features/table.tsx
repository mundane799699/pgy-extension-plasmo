import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  Modal,
  Tab,
  Tabs,
  Typography
} from "@mui/material"
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  type GridColDef
} from "@mui/x-data-grid"
import * as ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import moment from "moment"
import { useEffect, useRef, useState } from "react"

import { Storage } from "@plasmohq/storage"

const storage = new Storage()

const noteColumns: GridColDef[] = [
  { field: "noteId", headerName: "id", width: 70 },
  { field: "title", headerName: "标题", width: 130 },
  {
    field: "imgUrl",
    headerName: "图片",
    width: 150,
    renderCell: (params) => (
      <img
        src={params.value}
        alt="封面图片"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    )
  },
  {
    field: "readNum",
    headerName: "阅读数",
    type: "number",
    width: 90
  },
  {
    field: "likeNum",
    headerName: "点赞数",
    type: "number",
    width: 90
  },
  {
    field: "likeRate",
    headerName: "点赞率",
    width: 90
  },
  {
    field: "collectNum",
    headerName: "收藏数",
    type: "number",
    width: 90
  },
  {
    field: "collectRate",
    headerName: "收藏率",
    width: 90
  },
  {
    field: "likeCollectRate",
    headerName: "赞藏比",
    width: 90,
    type: "number"
  },
  {
    field: "isAdvertise",
    headerName: "是否广告",
    width: 90
  },
  {
    field: "isVideo",
    headerName: "是否视频",
    width: 90
  },
  {
    field: "brandName",
    headerName: "品牌",
    width: 90
  },
  {
    field: "date",
    headerName: "日期",
    width: 90
  }
]

const bloggerColumns: GridColDef[] = [
  { field: "name", headerName: "博主名称", width: 150 },
  { field: "userId", headerName: "博主id", width: 200 },
  {
    field: "headPhoto",
    headerName: "头像",
    width: 150,
    renderCell: (params) => (
      <img
        src={params.value}
        alt="封面图片"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    )
  },
  { field: "location", headerName: "地区", width: 90 },
  { field: "fansCount", headerName: "粉丝数", width: 90 },
  { field: "likeCollectCountInfo", headerName: "获赞与收藏", width: 90 },
  { field: "gender", headerName: "性别", width: 90 },
  { field: "tagsStr", headerName: "标签", width: 90 },
  { field: "noteSignName", headerName: "机构", width: 90 },
  { field: "profileUrl", headerName: "小红书主页链接", width: 400 }
]

export const Table = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noteList, setNoteList] = useState([])
  const [bloggerList, setBloggerList] = useState([])
  const bloggerIdSetRef = useRef(new Set())
  const noteIdSetRef = useRef(new Set())
  const bloggerName = useRef("")
  const bloggerId = useRef("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  useEffect(() => {
    window.addEventListener("FROM_INJECTED", onMessageListener)
    storage.get("bloggerList").then((data) => {
      if (data && Array.isArray(data)) {
        setBloggerList(data)
        bloggerIdSetRef.current = new Set(data.map((item) => item.userId))
      }
    })
    return () => {
      window.removeEventListener("FROM_INJECTED", onMessageListener)
    }
  }, [])

  const onMessageListener = async (e: any) => {
    const type = e.detail.type
    if (type === "NOTES_DETAIL") {
      addNotesDetail(e.detail.responseText)
    } else if (type === "BLOGGER_INFO") {
      addBloggerInfo(e.detail.responseText)
    }
  }

  function noteToolbar() {
    return (
      <GridToolbarContainer>
        <Button onClick={exportToExcel}>导出Excel</Button>
      </GridToolbarContainer>
    )
  }

  function bloggerToolbar() {
    return (
      <GridToolbarContainer>
        <Button onClick={() => {}}>导出Excel</Button>
        <Button onClick={deleteAllBlogger}>删除所有</Button>
        <Button onClick={deleteSelectedBlogger}>删除选中</Button>
      </GridToolbarContainer>
    )
  }

  const deleteSelectedBlogger = () => {
    setDialogOpen(true)
  }

  const deleteAllBlogger = () => {
    setDialogTitle("确定删除所有博主信息吗？")
    setDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    setBloggerList([])
    storage.set("bloggerList", [])
    bloggerIdSetRef.current.clear()
    setDialogOpen(false)
  }

  const DeleteConfirmModal = ({ open, onClose, onConfirm, title }) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Disagree
          </Button>
          <Button onClick={onConfirm} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("笔记数据")

    // 添加表头
    worksheet.addRow(noteColumns.map((col) => col.headerName))

    // 添加数据
    noteList.forEach((row) => {
      worksheet.addRow(noteColumns.map((col) => row[col.field]))
    })

    // 生成二进制数据
    const buffer = await workbook.xlsx.writeBuffer()
    const formattedDate = moment(new Date().getTime()).format("YYYYMMDDHHmmss")
    // 使用 file-saver 保存文件
    saveAs(
      new Blob([buffer]),
      `${bloggerName.current}_${bloggerId.current}_${formattedDate}.xlsx`
    )
  }

  const addBloggerInfo = (responseText: string) => {
    const result = JSON.parse(responseText)
    const { data } = result
    const {
      userId,
      name,
      headPhoto,
      location,
      fansCount,
      likeCollectCountInfo,
      gender,
      contentTags,
      featureTags,
      noteSign
    } = data
    bloggerId.current = userId
    bloggerName.current = name
    if (bloggerIdSetRef.current.has(userId)) {
      return
    }
    const contentTagList = contentTags.map((tag) => tag.taxonomy1Tag)
    const allTags = contentTagList.concat(featureTags)
    const tagsStr = allTags.join(" ")
    const bloggerInfo = {
      userId,
      name,
      headPhoto,
      location,
      fansCount,
      likeCollectCountInfo,
      gender,
      tagsStr,
      noteSignName: noteSign ? noteSign.name : "无机构",
      profileUrl: `https://www.xiaohongshu.com/user/profile/${userId}`
    }
    setBloggerList((prev) => {
      const newList = [bloggerInfo, ...prev]
      storage.set("bloggerList", newList)
      return newList
    })
  }

  const addNotesDetail = (responseText: string) => {
    const result = JSON.parse(responseText)
    const { data } = result
    const { list } = data
    const newData = []
    for (const item of list) {
      if (!noteIdSetRef.current.has(item.noteId)) {
        const {
          readNum,
          likeNum,
          collectNum,
          isAdvertise,
          isVideo,
          imgUrl,
          title,
          brandName = "",
          noteId,
          date
        } = item
        newData.push({
          readNum,
          likeNum,
          likeRate: ((likeNum / readNum) * 100).toFixed(2) + "%",
          collectNum,
          collectRate: ((collectNum / readNum) * 100).toFixed(2) + "%",
          likeCollectRate: (likeNum / collectNum).toFixed(2),
          isAdvertise: isAdvertise ? "是" : "否",
          isVideo: isVideo ? "是" : "否",
          imgUrl,
          title,
          brandName,
          noteId,
          date
        })
        noteIdSetRef.current.add(noteId)
      }
    }
    setNoteList((prev) => [...prev, ...newData])
  }

  const [tabValue, setTabValue] = useState(0)

  return (
    <>
      <button
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="p-2 text-sm rounded-lg transition-all border border-slate-800
      bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-blue-500">
        {`${open ? "收起" : "显示"}表格(${noteList.length})`}
      </button>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: "80%" }
        }}>
        <Box sx={{ p: 4, height: "100%" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="笔记数据" />
            <Tab label="博主信息" />
          </Tabs>
          {tabValue === 0 && (
            <div style={{ height: "calc(100% - 48px)", width: "100%" }}>
              <DataGrid
                rows={noteList}
                columns={noteColumns}
                getRowId={(row) => row.noteId}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 }
                  }
                }}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                checkboxSelection
                slots={{
                  toolbar: noteToolbar
                }}
              />
            </div>
          )}
          {tabValue === 1 && (
            <div style={{ height: "calc(100% - 48px)", width: "100%" }}>
              <DataGrid
                rows={bloggerList}
                columns={bloggerColumns}
                getRowId={(row) => row.userId}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 }
                  }
                }}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                checkboxSelection
                slots={{
                  toolbar: bloggerToolbar
                }}
              />
            </div>
          )}
        </Box>
      </Drawer>
      <DeleteConfirmModal
        open={dialogOpen}
        title={dialogTitle}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
