// import { Button } from "@/components/ui/button";

// export function MediaPagination() {
//   const handlePageChange = (newPage: number) => {
//     if (newPage < 1 || newPage > totalPages) return;
//     setPage(newPage);
//   };
//   return (
//     <div className="p-4 flex justify-end items-center space-x-2">
//       <Button
//         variant="outline"
//         size="sm"
//         disabled={page === 1}
//         onClick={() => handlePageChange(page - 1)}
//       >
//         Previous
//       </Button>
//       <span className="text-sm">
//         Page {page} of {totalPages}
//       </span>
//       <Button
//         variant="outline"
//         size="sm"
//         disabled={page === totalPages}
//         onClick={() => handlePageChange(page + 1)}
//       >
//         Next
//       </Button>
//     </div>
//   );
// }
