import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { FaUserMd, FaProcedures, FaHospitalAlt, FaMoneyBillWave } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import dashboardBg from '../assets/dashboard-bg.svg';
import { dashboardApi, hospitalsApi } from '../services/api';

const workflow = [
  "Signup → OTP verification → login",
  "Create hospital and choose an active hospital",
  "Add departments, doctors, and patients",
  "Schedule appointments and prepare bed infrastructure",
  "Create admissions, billing, and payments",
  "Review dashboard metrics and audit logs"
];

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardData, hospitalsData, trendData] = await Promise.all([
          dashboardApi.stats(),
          hospitalsApi.list(),
          dashboardApi.admissionsTrend()
        ]);
        setStats({
          patients: dashboardData.totalPatients,
          doctors: dashboardData.totalDoctors,
          hospitals: hospitalsData.total || hospitalsData.items.length,
          revenue: dashboardData.totalRevenue
        });
        setChartData(trendData.map(item => ({ name: item.month, Admissions: item.admissions })));
      } catch (error) {
        toast.error('Failed to load dashboard stats');
        // Fallback to default stats
        setStats({
          patients: 0,
          doctors: 0,
          hospitals: 0,
          revenue: 0
        });
        setChartData([
          { name: 'Jan', Admissions: 0 },
          { name: 'Feb', Admissions: 0 },
          { name: 'Mar', Admissions: 0 },
          { name: 'Apr', Admissions: 0 },
          { name: 'May', Admissions: 0 },
          { name: 'Jun', Admissions: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    toast.success('Welcome to your dynamic dashboard!');
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `url(${dashboardBg}) center/cover no-repeat fixed, linear-gradient(180deg, #f6fafc 0%, #edf3f7 100%)`,
        p: 4
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <Typography variant="h3" fontWeight={700} mb={2} color="#0f7e98">
        Welcome, {user.name}!
      </Typography>
      <Typography variant="subtitle1" mb={4} color="#627587">
        Here's your hospital's operational overview at a glance.
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <FaProcedures size={32} color="#0f7e98" />
              <Typography variant="h5" fontWeight={600}>{stats.patients}</Typography>
              <Typography color="text.secondary">Patients</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <FaUserMd size={32} color="#0f7e98" />
              <Typography variant="h5" fontWeight={600}>{stats.doctors}</Typography>
              <Typography color="text.secondary">Doctors</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <FaHospitalAlt size={32} color="#0f7e98" />
              <Typography variant="h5" fontWeight={600}>{stats.hospitals}</Typography>
              <Typography color="text.secondary">Hospitals</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <FaMoneyBillWave size={32} color="#0f7e98" />
              <Typography variant="h5" fontWeight={600}>₹{stats.revenue.toLocaleString()}</Typography>
              <Typography color="text.secondary">Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ background: 'rgba(255,255,255,0.85)', borderRadius: 3, p: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="#0f7e98">Admissions Trend</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Admissions" fill="#0f7e98" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ background: 'rgba(255,255,255,0.85)', borderRadius: 3, p: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="#0f7e98">Workflow Checklist</Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {workflow.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 8, fontSize: 16 }}>{item}</li>
          ))}
        </ul>
      </Box>
    </Box>
  );
}
