import { useState } from "react";
import { ThSortPropsInterface } from "./th-sort-props-interface";
import { Icon } from "../icon/icon";

export function ThSort({
  thSortConfigs,
  defaultKey,
  onSortChange,
}: ThSortPropsInterface) {
  const [sortState, setSortState] = useState<{
    key: string;
    sortOrder: "asc" | "desc";
  } | null>(defaultKey || null);

  const handleSortClick = (key: string) => {
    if (!key) return;

    setSortState((prevState) => {
      const newSortOrder =
        prevState?.key === key && prevState.sortOrder === "asc"
          ? "desc"
          : "asc";
      onSortChange?.(key, newSortOrder);
      return { key, sortOrder: newSortOrder };
    });
  };

  return (
    <>
      {thSortConfigs.map((th, index) => (
        <th
          key={index}
          className={th.className}
          onClick={() => th.sort && th.key && handleSortClick(th.key)}
          style={th.sort ? { cursor: "pointer" } : undefined}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{th.title}</span>
            {th.sort && th.key && (
              <span style={{ marginLeft: "8px" }}>
                {sortState?.key === th.key ? (
                  sortState.sortOrder === "asc" ? (
                    <Icon name="ArrowUp" size={16}></Icon>
                  ) : (
                    <Icon name="ArrowDown" size={16}></Icon>
                  )
                ) : (
                  <Icon name="Code" className="rotate-90" size={16}></Icon>
                )}
              </span>
            )}
          </div>
        </th>
      ))}
    </>
  );
}
