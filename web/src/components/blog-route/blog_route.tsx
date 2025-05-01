"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { $t } from "@/app/lang";
import Link from "next/link";
import { blogsStore } from "@adapter/blog/store";
import { BlogList } from "@adapter/blog/domain";
import { debounce } from "@adapter/share/utils/debounce";

export default function BlogRoute({ value }: { value: BlogList }) {
  const route = useRouter();
  const { page, setPage, setFilter, setSortOrder, useGetAll, useDelete } =
    blogsStore();
  const { data, isError, isLoading } = useGetAll(value);
  const { mutate, isPending } = useDelete();
  const debouncedSetFilter = useMemo(
    () => debounce((value) => setFilter(value as string), 420),
    [setFilter]
  );
  if (!data || isError) {
    return null;
  }
  const pages = [];
  const { totalPages } = data.meta;

  if (isLoading) return "isLoading ....";

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8">
          Orders 
        </h1>
      </div>
      <div className="flow-root">
        <div className="bg-gray-100 mt-4 mb-8 p-2 rounded flex justify-between gap-4">
          <div className="flex w-xl gap-4">
            <label className="input input-sm w-4/6">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                type="search"
                required
                placeholder="Search"
                onChange={(e) => debouncedSetFilter(e.target.value as string)}
              />
            </label>
            <select
              defaultValue="Sort by"
              className="select w-2/6 select-sm"
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            >
              <option value="desc">Sort Descending</option>
              <option value="asc">Sort Ascending</option>
            </select>
          </div>
          <Link href="/en/detail/">
            <button className="btn btn-sm btn-accent min-w-4">
              Create blog
            </button>
          </Link>
        </div>
        <div className="divider"></div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{$t`Title`}</th>
                <th>{$t`Content`}</th>
                <th>{$t`Author`}</th>
                <th>{$t`Category`}</th>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {data.data.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => route.push(`/en/detail/?id=${item.id}`)}
                >
                  <th>{item.title}</th>
                  <td>{item.content}</td>
                  <td>{item.author}</td>
                  <td>{item.category}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mutate(item.id);
                      }}
                      className={`btn btn-error btn-xs btn-outline ${isPending ? "btn-active" : ""}`}
                      disabled={isPending}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="join">
          {pages.map((item, idx) => {
            return (
              <button
                key={idx}
                onClick={() => setPage(item as number)}
                className={`join-item btn btn-sm ${page === item ? "btn-active" : ""}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
