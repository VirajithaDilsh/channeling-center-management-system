const DashboardHome = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2>Total Doctors</h2>
                    <p className="text-2xl font-bold">15</p>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2>Total Patients</h2>
                    <p className="text-2xl font-bold">120</p>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2>Today's Appointments</h2>
                    <p className="text-2xl font-bold">32</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;