import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Download as DownloadIcon } from '@mui/icons-material';

// Sample data - replace with actual API calls
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'technology_type', headerName: 'Technology Type', width: 150 },
  { field: 'development_stage', headerName: 'Stage', width: 130 },
  { field: 'region', headerName: 'Region', width: 130 },
  { field: 'organization', headerName: 'Organization', width: 200 },
  { field: 'start_date', headerName: 'Start Date', width: 130 },
  { field: 'source_link', headerName: 'Source', width: 200 },
];

const rows = [
  {
    id: 1,
    name: 'GigaChat',
    technology_type: 'Generative AI',
    development_stage: 'On Market',
    region: 'Russia',
    organization: 'Sber',
    start_date: '2023-03-28',
    source_link: 'https://example.com/gigachat',
  },
  // Add more sample data as needed
];

const ResearchList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const handleExport = () => {
    // Implement export to Excel functionality
    console.log('Exporting to Excel...');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Research List</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export to Excel
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Region</InputLabel>
            <Select
              value={regionFilter}
              label="Region"
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Russia">Russia</MenuItem>
              <MenuItem value="USA">USA</MenuItem>
              <MenuItem value="China">China</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Technology Type</InputLabel>
            <Select
              value={technologyFilter}
              label="Technology Type"
              onChange={(e) => setTechnologyFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Generative AI">Generative AI</MenuItem>
              <MenuItem value="Robotics">Robotics</MenuItem>
              <MenuItem value="Computer Vision">Computer Vision</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Development Stage</InputLabel>
            <Select
              value={stageFilter}
              label="Development Stage"
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Research">Research</MenuItem>
              <MenuItem value="Prototype">Prototype</MenuItem>
              <MenuItem value="On Market">On Market</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default ResearchList; 