import { Box, Button, Drawer, Modal } from "@mui/material"
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

const columns: GridColDef[] = [
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

export const Table = () => {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState([])
  const noteIdSetRef = useRef(new Set())
  const bloggerName = useRef("")
  const bloggerId = useRef("")
  const isActiveTab = useRef(false)

  const checkIfActiveTab = () => {
    return new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        { action: "isActiveTab" },
        function (response) {
          resolve(response.isActive)
        }
      )
    })
  }

  const onMessageListener = async (e: any) => {
    isActiveTab.current = await checkIfActiveTab()
    if (!isActiveTab.current) {
      return
    }
    const type = e.detail.type
    if (type === "NOTES_DETAIL") {
      addNotesDetail(e.detail.responseText)
    } else if (type === "BLOGGER_INFO") {
      addBloggerInfo(e.detail.responseText)
    }
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        {/* <GridToolbarExport /> */}
        <Button onClick={exportToExcel}>导出Excel</Button>
      </GridToolbarContainer>
    )
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("笔记数据")

    // 添加表头
    worksheet.addRow(columns.map((col) => col.headerName))

    // 添加数据
    rows.forEach((row) => {
      worksheet.addRow(columns.map((col) => row[col.field]))
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
    const { userId, name } = data
    bloggerId.current = userId
    bloggerName.current = name
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
    setRows((prev) => [...prev, ...newData])
  }

  useEffect(() => {
    window.addEventListener("FROM_INJECTED", onMessageListener, false)
    checkIfActiveTab().then((isActive) => {
      isActiveTab.current = isActive
    })
    return () => {
      window.removeEventListener("FROM_INJECTED", onMessageListener)
    }
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 text-sm rounded-lg transition-all border border-slate-800
      bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-blue-500">
        {`${open ? "收起" : "显示"}表格(${rows.length})`}
      </button>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: "80%" }
        }}>
        <Box sx={{ p: 4, height: "100%" }}>
          <div style={{ height: "calc(100% - 20px)", width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.noteId}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
              pageSizeOptions={[10, 20, 30, 50, 100]}
              checkboxSelection
              slots={{
                toolbar: CustomToolbar
              }}
            />
          </div>
        </Box>
      </Drawer>
    </>
  )
}
