import { useEffect, useState } from "react";
import { Card } from "../components/AgPage/AgCard";
import { user_access_type } from "../commons/user_access_type";
import { useUser } from '../context/UserContext';
import Loading from "../components/Loading";
import { ag_category } from "../enum/ag-category";
import AgService from "../services/AGService";
import CreateAg from "../components/AgPage/CreatingAg";

interface Ag {
  id: number;
  title: string;
  description: string;
  ag_date: string;
  location: string;
  minimum_participants: number;
  category: ag_category;
  mannager_id: number;
}

interface AgsResponse {
  ags: Ag[];
  totalCount: number;
}

export default function AGListPage() {
  const [ags, setAgs] = useState<Ag[]>([]);
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>("");
  const [creatingAg, setCreatingAg] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add state for admin check

  function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  const handleAgCreated = () => {
    setCreatingAg(false);
    fetchAgs();
  };

  useEffect(() => {
    fetchAgs();
    checkAdminRole();
  }, []);

  const checkAdminRole = () => {
    setIsAdmin(user?.role === user_access_type.ADMIN || user?.role === user_access_type.SUPER_ADMIN);
  };

  const fetchAgs = async () => {
    setLoading(true);
    try {
      const data: AgsResponse = await AgService.listAgs({ page: 1, limit: 10 });
      if (data && data.ags) {
        setAgs(data.ags);
      } else {
        setError('Invalid AGs format');
      }
    } catch (err) {
      console.log(err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await AgService.deleteAg(id);
      fetchAgs();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="container mx-auto mt-5 p-4">
      <div className="flex justify-between mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md"
            />
          </label>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md"
            />
          </label>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        {isAdmin && (
          <div>
            <button
              onClick={() => setCreatingAg(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Create Ag
            </button>
          </div>
        )}
      </div>
      {
        creatingAg && (
          <CreateAg onEventCreated={handleAgCreated} onCancel={() => setCreatingAg(false)} />
        )
      }
      <h1 className="text-3xl font-bold mb-4">AG List</h1>
      {loading && <Loading />}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ags.map((ag) => (
          <Card
            key={ag.id}
            title={ag.title}
            content={ag.description}
            subtext={ag.ag_date}
            pageLink={"./Ag/AgPage/" + ag.id}
            showActions={isAdmin} // Show edit and delete actions only if admin
            onEdit={() => { }}
            onDelete={() => handleDelete(ag.id)}
          />
        ))}
      </div>
    </div>
  );
}