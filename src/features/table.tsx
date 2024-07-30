import { isUtf8 } from "buffer"
import { Box, Modal } from "@mui/material"
import {
  DataGridPremium,
  GridToolbarContainer,
  GridToolbarExport,
  LicenseInfo,
  type GridColDef
} from "@mui/x-data-grid-premium"
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
    field: "collectNum",
    headerName: "收藏数",
    type: "number",
    width: 90
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

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport csvOptions={{ utf8WithBom: true }} />
    </GridToolbarContainer>
  )
}

export const Table = () => {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState([])
  const noteIdSetRef = useRef(new Set())
  const onMessageListener = (e: any) => {
    if (e.detail.type === "NOTES_DETAIL") {
      addNotesDetail(e.detail.responseText)
    }
  }

  const addNotesDetail = (responseText: string) => {
    const result = JSON.parse(responseText)
    const { data } = result
    const { list } = data
    console.log("list = ", list)
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
          collectNum,
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
    // 付费版激活
    LicenseInfo.setLicenseKey(
      "e0d9bb8070ce0054c9d9ecb6e82cb58fTz0wLEU9MzI0NzIxNDQwMDAwMDAsUz1wcmVtaXVtLExNPXBlcnBldHVhbCxLVj0y"
    )
    window.addEventListener("FROM_INJECTED", onMessageListener, false)
    return () => {
      window.removeEventListener("FROM_INJECTED", onMessageListener)
    }
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-sm rounded-lg transition-all border border-slate-800
      bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-blue-500">
        显示表格
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 1200,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4
          }}>
          <div style={{ height: 800, width: "100%" }}>
            <DataGridPremium
              rows={rows}
              columns={columns}
              getRowId={(row) => row.noteId}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50, 100]}
              checkboxSelection
              components={{
                Toolbar: CustomToolbar
              }}
            />
          </div>
        </Box>
      </Modal>
    </>
  )
}
