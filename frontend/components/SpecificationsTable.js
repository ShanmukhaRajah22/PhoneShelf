const labels = {
  display: "Display",
  processor: "Processor",
  RAM: "RAM",
  storage: "Storage",
  battery: "Battery",
  camera: "Camera",
  operatingSystem: "Operating system",
};

export default function SpecificationsTable({
  specifications,
  comparison = false,
}) {
  return (
    <div className="overflow-x-auto border border-neutral-200">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <tbody>
          {Object.entries(labels).map(([key, label]) => (
            <tr
              key={key}
              className="border-b border-neutral-200 last:border-b-0"
            >
              <th className="w-1/3 bg-neutral-50 px-4 py-3 font-medium text-neutral-600">
                {label}
              </th>
              {comparison ? (
                specifications.map((phone) => (
                  <td key={phone._id} className="px-4 py-3 text-black">
                    {phone.specifications?.[key] || "—"}
                  </td>
                ))
              ) : (
                <td className="px-4 py-3 text-black">
                  {specifications?.[key] || "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
