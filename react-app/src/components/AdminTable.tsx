interface AdminTableProps {
    headers: string[];
    data: string[][];
}

export default function AdminTable({ headers, data }: AdminTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="table table-xs">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                        <th>action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                            <td> <button className="btn">action</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
