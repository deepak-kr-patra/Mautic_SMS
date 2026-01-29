import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMauticStore } from "../zustand/useMauticStore";

export default function SmsList() {
    const navigate = useNavigate();
    const { smsCampaigns, setSmsCampaigns } = useMauticStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (smsCampaigns.length > 0) return; // already cached
        setLoading(true);
        axios.get("http://localhost:5000/api/sms")
            .then((res) => setSmsCampaigns(res.data))
            .finally(() => setLoading(false));
    }, [smsCampaigns, setSmsCampaigns]);

    if (loading) return <div className="p-8 text-gray-600">Loading...</div>;

    return (
        <div className="p-8 h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">📱 SMS Campaigns</h1>

            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-200 shadow-md">
                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold">Name</th>
                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                            <th className="text-left py-3 px-4 font-semibold">Sent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {smsCampaigns.map((sms) => (
                            <tr
                                key={sms.id}
                                className="hover:bg-blue-50 cursor-pointer even:bg-gray-50"
                                onClick={() => navigate(`/sms/${sms.id}`)}
                            >
                                <td className="py-3 px-4">{sms.name}</td>
                                <td className="py-3 px-4">{sms.category?.title || "—"}</td>
                                <td className="py-3 px-4">{sms.sentCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
