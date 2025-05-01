"use client";

import { $t } from "@/app/lang";
import { useProducts } from "@adapter/products/hooks";
import { useRouter } from "next/navigation";

export default function ListProducts() {
  const route = useRouter();
  const { resource, state } = useProducts();
  if (!resource.data) return null;
  const { results } = resource.data;
  const handlePage = (currentPage: number) => {
    state.setFilters({ currentPage });
  };

  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>{$t`Name`}</th>
              <th>{$t`Price`}</th>
              <th>{$t`Description`}</th>
              <th>{$t`Categories`}</th>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer"
                onClick={() => route.push(`?id=${item.id}`)}
              >
                <th>{item.name}</th>
                <td>{item.price}</td>
                <td>{item.description}</td>
                <td>{item.categories.name}</td>
                <td>
                  <button
                    className={`btn btn-error btn-xs btn-outline ${
                      resource.isPending ? "btn-active" : ""
                    }`}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divider"/>
      <div className="join">
        {Array.from({ length: resource.data.totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={i}
              onClick={() => handlePage(page)}
              className={`join-item btn ${
                page === resource.data.currentPage && `btn-disabled`
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
}
