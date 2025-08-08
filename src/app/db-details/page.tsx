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

interface DbDetail {
  id: number;
  name: string;
  type: string;
  connection_string: string;
  description: string;
}

const DbDetailsPage: React.FC = () => {
  const { token } = useAuth();
  const [dbDetails, setDbDetails] = useState<DbDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDetail, setEditingDetail] = useState<DbDetail | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    connection_string: "",
    description: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDbDetails();
  }, []);

  const fetchDbDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/db-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch database details");
      const data = await res.json();
      setDbDetails(data);
    } catch (err) {
      setError("Failed to load database details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredDetails = dbDetails.filter((detail) =>
    detail.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (detail: DbDetail | null = null) => {
    if (detail) {
      setEditingDetail(detail);
      setFormData({
        name: detail.name,
        type: detail.type,
        connection_string: detail.connection_string,
        description: detail.description,
      });
    } else {
      setEditingDetail(null);
      setFormData({
        name: "",
        type: "",
        connection_string: "",
        description: "",
      });
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
    if (!formData.name.trim() || !formData.type.trim() || !formData.connection_string.trim()) {
      setSnackbar({ open: true, message: "Name, type, and connection string are required", severity: "error" });
      return;
    }
    try {
      const url = editingDetail
        ? `http://localhost:5000/api/db-details/${editingDetail.id}`
        : "http://localhost:5000/api/db-details";
      const method = editingDetail ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save database detail");
      setSnackbar({ open: true, message: "Database detail saved", severity: "success" });
      handleCloseDialog();
      fetchDbDetails();
    } catch (err) {
      setSnackbar({ open: true, message: "Error saving database detail", severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this database detail?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/db-details/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete database detail");
      setSnackbar({ open: true, message: "Database detail deleted", severity: "success" });
      fetchDbDetails();
    } catch (err) {
      setSnackbar({ open: true, message: "Error deleting database detail", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Database Details
      </Typography>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <TextField
          label="Search Database Details"
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
                <TableCell>Type</TableCell>
                <TableCell>Connection String</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDetails.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell>{detail.name}</TableCell>
                  <TableCell>{detail.type}</TableCell>
                  <TableCell>{detail.connection_string}</TableCell>
                  <TableCell>{detail.description}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(detail)} size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(detail.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDetails.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No database details found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingDetail ? "Edit Database Detail" : "Add New Database Detail"}</DialogTitle>
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
            label="Type"
            name="type"
            fullWidth
            variant="outlined"
            value={formData.type}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            label="Connection String"
            name="connection_string"
            fullWidth
            variant="outlined"
            value={formData.connection_string}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDetail ? "Update" : "Create"}
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

export default DbDetailsPage;
