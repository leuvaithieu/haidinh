type Vehicle = {
  id: string;
  licensePlate: string,
  vehicleType: string,
  seatCount: number,
  status: string,
  name:string,
};

type VehicleListProps = {
  vehicles: Vehicle[],
  onEdit:(vehicle:Vehicle) =>void,
  onDelete:(vehicle:Vehicle)=>void,
  userRole:string,

};

export default function VehicleList({
  vehicles,onEdit,onDelete, userRole
}: VehicleListProps) {
  function normalizeLicensePlate(value:string){
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g,"")
  }
  
  function formatLicensePlate(value: string) {
      const cleaned = normalizeLicensePlate(value);

      if(cleaned.length <= 3){
          return cleaned;
      }

      if(cleaned.length <= 6){
          return cleaned;
      }

      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}.${cleaned.slice(6, 8)}`;
  }
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">STT</th>
              <th className="px-6 py-3">Biển số</th>
              <th className="px-6 py-3">Loại xe</th>
              <th className="px-6 py-3">Mã xe</th>
              <th className="px-6 py-3">Số chỗ</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {vehicles.map((vehicle,index) => (
              <tr
                key={vehicle.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {formatLicensePlate(vehicle.licensePlate)}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {vehicle.vehicleType}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {vehicle.name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {vehicle.seatCount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      vehicle.status === 'ACTIVE'
                        ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                        : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'
                    }
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(vehicle)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    Sửa
                  </button>
                  {userRole ==='ADMIN' && (
                    <button 
                      type="button" 
                      onClick={()=> onDelete(vehicle)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {vehicle.licensePlate}
                </p>
                <p className="font-semibold text-slate-900">
                  {vehicle.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {vehicle.vehicleType}
                </p>
              </div>

              <span
                className={
                  vehicle.status === 'ACTIVE'
                    ? 'shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'
                    : 'shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'
                }
              >
                {vehicle.status}
              </span>
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-500">
                Số chỗ: {vehicle.seatCount}
              </p>
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onEdit(vehicle)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                Sửa
              </button>
              {userRole ==='ADMIN' && (
              <button 
                type="button" 
                onClick={()=> onDelete(vehicle)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Xóa
              </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}