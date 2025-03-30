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
  Grid,
  Autocomplete,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ReferenceItem {
  id: number;
  name: string;
}

const ResearchForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology_type: '',
    development_stage: '',
    start_date: null,
    source_link: '',
    regions: [],
    organizations: [],
    people: [],
    directions: [],
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [newItem, setNewItem] = useState('');

  // Sample data - replace with actual API calls
  const technologyTypes: ReferenceItem[] = [
    { id: 1, name: 'Generative AI' },
    { id: 2, name: 'Robotics' },
    { id: 3, name: 'Computer Vision' },
  ];

  const developmentStages: ReferenceItem[] = [
    { id: 1, name: 'Research' },
    { id: 2, name: 'Prototype' },
    { id: 3, name: 'On Market' },
  ];

  const regions: ReferenceItem[] = [
    { id: 1, name: 'Russia' },
    { id: 2, name: 'USA' },
    { id: 3, name: 'China' },
  ];

  const organizations: ReferenceItem[] = [
    { id: 1, name: 'Sber' },
    { id: 2, name: 'Google' },
    { id: 3, name: 'Microsoft' },
  ];

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, start_date: date });
  };

  const handleOpenDialog = (type: string) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem('');
  };

  const handleAddNewItem = () => {
    // Implement adding new reference item
    console.log(`Adding new ${dialogType}:`, newItem);
    handleCloseDialog();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Implement form submission
    console.log('Form data:', formData);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add New Research
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Technology Type</InputLabel>
                <Select
                  value={formData.technology_type}
                  label="Technology Type"
                  onChange={handleChange('technology_type')}
                  required
                >
                  {technologyTypes.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog('technology_type')}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <AddIcon />
                </IconButton>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Development Stage</InputLabel>
                <Select
                  value={formData.development_stage}
                  label="Development Stage"
                  onChange={handleChange('development_stage')}
                  required
                >
                  {developmentStages.map((stage) => (
                    <MenuItem key={stage.id} value={stage.name}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog('development_stage')}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <AddIcon />
                </IconButton>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source Link"
                value={formData.source_link}
                onChange={handleChange('source_link')}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={regions}
                getOptionLabel={(option) => option.name}
                value={formData.regions}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, regions: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Regions" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={organizations}
                getOptionLabel={(option) => option.name}
                value={formData.organizations}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, organizations: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Organizations" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Save Research
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New {dialogType.replace('_', ' ')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddNewItem} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResearchForm; 