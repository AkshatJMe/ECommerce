//@ts-nocheck
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "react-icons/ai";
import {
  Column,
  usePagination,
  useSortBy,
  useTable,
  TableOptions,
} from "react-table";

function TableHOC<T extends Object>(
  columns: Column<T>[],
  data: T[],
  containerClassname: string,
  heading: string,
  showPagination: boolean = false
) {
  return function HOC() {
    const options: TableOptions<T> = {
      columns,
      data,
      initialState: {
        pageSize: 6,
      },
    };

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      prepareRow,
      nextPage,
      pageCount,
      state: { pageIndex },
      previousPage,
      canNextPage,
      canPreviousPage,
    } = useTable(options, useSortBy, usePagination);

    return (
      <div className={`p-4 ${containerClassname}`}>
        <h2 className="text-xl font-bold mb-4">{heading}</h2>

        <table className="w-full border-collapse">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-gray-100"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="p-2 border-b border-gray-200 text-left"
                  >
                    <div className="flex items-center">
                      {column.render("Header")}
                      {column.isSorted && (
                        <span className="ml-2 text-gray-500">
                          {column.isSortedDesc ? (
                            <AiOutlineSortDescending />
                          ) : (
                            <AiOutlineSortAscending />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);

              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="p-2 border-b border-gray-200"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {showPagination && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={!canPreviousPage}
              onClick={previousPage}
            >
              Prev
            </button>
            <span className="text-gray-700">{`${
              pageIndex + 1
            } of ${pageCount}`}</span>
            <button
              className="px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={!canNextPage}
              onClick={nextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };
}

export default TableHOC;
