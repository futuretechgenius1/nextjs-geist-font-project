"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Application {
  id: number;
  name: string;
  description: string;
  owner: string;
}

const ApplicationsPage: React.FC = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (app: Application | null = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({ name: app.name, description: app.description, owner: app.owner });
    } else {
      setEditingApp(null);
      setFormData({ name: "", description: "", owner: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: "Name is required", severity: "error" });
      return;
    }
    try {
      const url = editingApp
        ? `http://localhost:5000/api/applications/${editingApp.id}`
        : "http://localhost:5000/api/applications";
      const method = editingApp ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save application");
      setSnackbar({ open: true, message: "Application saved", severity: "success" });
      handleCloseDialog();
      fetchApplications();
    } catch (err) {
      setSnackbar({ open: true, message: "Error saving application", severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete application");
      setSnackbar({ open: true, message: "Application deleted", severity: "success" });
      fetchApplications();
    } catch (err) {
      setSnackbar({ open: true, message: "Error deleting application", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Applications
      </Typography>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <TextField
          label="Search Applications"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "300px" }}
        />
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add New
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.description}</TableCell>
                  <TableCell>{app.owner}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(app)} size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(app.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingApp ? "Edit Application" : "Add New Application"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleFormChange}
            multiline
            rows={3}
          />
          <TextField
            margin="dense"
            label="Owner"
            name="owner"
            fullWidth
            variant="outlined"
            value={formData.owner}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingApp ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ApplicationsPage;
