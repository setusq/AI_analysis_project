import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'AI', value: 12 },
  { name: 'ML', value: 8 },
  { name: 'DL', value: 6 },
  { name: 'NLP', value: 4 },
  { name: 'CV', value: 3 },
];

const Dashboard: React.FC = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Research by Technology Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h3">33</Typography>
                <Typography color="textSecondary">Total Research</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">5</Typography>
                <Typography color="textSecondary">Technology Types</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">8</Typography>
                <Typography color="textSecondary">Organizations</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">6</Typography>
                <Typography color="textSecondary">Regions</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard; 