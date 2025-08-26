"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../api";
import { useStorePost } from "../store";
import PostsTableLoading from "./PostsTableLoading";
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
import { BookingRecord } from "../type";

// const ImageFromDrive = ({ url }: { url: string }) => {
//   const [base64Image, setBase64Image] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchImageAndConvert = async () => {
//       try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error("Network response was not ok");
//         const blob = await response.blob();

//         const reader = new FileReader();
//         reader.onloadend = () => {
//           if (typeof reader.result === "string") {
//             setBase64Image(reader.result);
//           } else {
//             setBase64Image(null);
//           }
//         };
//         reader.readAsDataURL(blob);
//       } catch (error) {
//         console.error("Error loading image:", error);
//         setBase64Image(null);
//       }
//     };

//     if (url) fetchImageAndConvert();
//   }, [url]);

//   if (!base64Image) return <span>Loading...</span>;
//   return (
//     <Image
//       src={base64Image}
//       alt="Hình ảnh từ Google Drive"
//       width={100}
//       height={100}
//       style={{ maxWidth: "100px", height: "auto" }}
//     />
//   );
// };

type PostsTableProps = {
  onEdit: (post: BookingRecord) => void;
};

export default function PostsTable({ onEdit }: PostsTableProps) {
  const posts = useStorePost((s) => s.posts);
  const setPosts = useStorePost((s) => s.setPosts);
  const qc = useQueryClient();

  const delMutation = useMutation<
    { id: string | number },
    unknown,
    { id: string | number },
    { prev?: BookingRecord[] }
  >({
    mutationFn: ({ id }) => deletePost({ id }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const prev = qc.getQueryData<BookingRecord[]>(["posts"]);
      // optimistic remove
      const next = (prev || posts).filter(
        (p: BookingRecord) => String(p.id) !== String(vars.id)
      );
      qc.setQueryData(["posts"], next);
      setPosts(next);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["posts"], ctx.prev);
        setPosts(ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th className="tbl-id">ID</th>
            <th className="tbl-name">Họ và tên</th>
            <th className="tbl-phone">Số điện thoại</th>
            <th className="tbl-in">check-in</th>
            <th className="tbl-out">check-out</th>
            <th className="tbl-number">Số lượng khách</th>
            <th className="tbl-room">loại phòng</th>
            <th className="tbl-action">-</th>
          </tr>
        </thead>
        <tbody>
          <PostsTableLoading>
            {posts.map((row: BookingRecord, idx: number) => (
              <tr key={row.id ?? idx}>
                <td className="mono">{row.id ?? "-"}</td>
                <td>{row["Họ và tên"] ?? "-"}</td>
                <td className="content">{row["Số điện thoại"] ?? "-"}</td>
                <td className="content">{row["Số lượng khách"] ?? "-"}</td>
                <td className="content">{row["check-in"] ?? "-"}</td>
                <td className="content">{row["check-out"] ?? "-"}</td>
                <td className="mono">{row.created_at ?? "-"}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="rounded border border-[color:var(--border)] px-3 py-1 text-sm hover:bg-[color:var(--row)]"
                      onClick={() => onEdit?.(row)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded bg-red-500/80 px-3 py-1 text-sm text-black hover:opacity-90"
                      onClick={() =>
                        row.id !== undefined &&
                        delMutation.mutate({ id: row.id })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </PostsTableLoading>
        </tbody>
      </table>
    </div>
  );
}
