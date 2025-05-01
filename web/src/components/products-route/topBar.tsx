"use client";
import { productsStore } from "@adapter/products/store";
import { debounce } from "@adapter/share/utils/debounce";
import Link from "next/link";

export function TopBarProducts() {
  const setFilters = productsStore((s) => s.setFilters);

  const handleSearch = debounce((name) => {
    setFilters({ name });
    console.log("redener - seractrh");
  }, 400);
  const handleCategory = (categoryId: string) => {
    setFilters({ categoryId });
  };
  const handleSortName = (sort: string) => {
    setFilters({ sort });
  };
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <label className="input">
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
            onChange={(e) => handleSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <select
              onChange={(e) => handleSortName(e.target.value)}
              defaultValue=""
              className="select"
            >
              <option disabled={true}>Sort by</option>
              <option value="">Day</option>
              <option value="name:desc">Name</option>
              <option value="price:desc">Price</option>
            </select>
          </li>
        </ul>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <select
              onChange={(e) => handleCategory(e.target.value)}
              defaultValue="category"
              className="select"
            >
              <option disabled={true}>Filter Category</option>
              <option value="">all</option>
              <option value="1">Crimson</option>
              <option value="2">Amber</option>
              <option value="3">Velvet</option>
            </select>
          </li>
        </ul>
      </div>
      <div className="flex-none">
        <Link href="/en/products/detail">
          <button className="btn btn-sm btn-accent min-w-4">Create blog</button>
        </Link>
      </div>
    </div>
  );
}
