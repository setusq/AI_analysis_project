import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reference-tabpanel-${index}`}
      aria-labelledby={`reference-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReferenceLists: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; name: string } | null>(null);
  const [newItem, setNewItem] = useState('');

  // Sample data - replace with actual API calls
  const [technologyTypes, setTechnologyTypes] = useState([
    { id: 1, name: 'Generative AI' },
    { id: 2, name: 'Robotics' },
    { id: 3, name: 'Computer Vision' },
  ]);

  const [developmentStages, setDevelopmentStages] = useState([
    { id: 1, name: 'Research' },
    { id: 2, name: 'Prototype' },
    { id: 3, name: 'On Market' },
  ]);

  const [regions, setRegions] = useState([
    { id: 1, name: 'Russia' },
    { id: 2, name: 'USA' },
    { id: 3, name: 'China' },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: { id: number; name: string }) => {
    if (item) {
      setEditItem(item);
      setNewItem(item.name);
    } else {
      setEditItem(null);
      setNewItem('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditItem(null);
    setNewItem('');
  };

  const handleSaveItem = () => {
    // Implement saving reference item
    console.log('Saving item:', newItem);
    handleCloseDialog();
  };

  const handleDeleteItem = (id: number) => {
    // Implement deleting reference item
    console.log('Deleting item:', id);
  };

  const renderList = (items: { id: number; name: string }[]) => (
    <List>
      {items.map((item) => (
        <ListItem key={item.id}>
          <ListItemText primary={item.name} />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={() => handleOpenDialog(item)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDeleteItem(item.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reference Lists
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="reference tabs"
        >
          <Tab label="Technology Types" />
          <Tab label="Development Stages" />
          <Tab label="Regions" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
            >
              Add Technology Type
            </Button>
          </Box>
          {renderList(technologyTypes)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
            >
              Add Development Stage
            </Button>
          </Box>
          {renderList(developmentStages)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
            >
              Add Region
            </Button>
          </Box>
          {renderList(regions)}
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
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
          <Button onClick={handleSaveItem} color="primary">
            {editItem ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferenceLists; 