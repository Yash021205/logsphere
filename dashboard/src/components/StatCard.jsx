const StatCard = ({ title, value, color }) => {
  return (
    <div className="bg-[#0d162b] p-6 rounded-xl shadow-lg border border-[#1f2a44]">
      <h2 className="text-lg text-gray-400">{title}</h2>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
};

export default StatCard;
