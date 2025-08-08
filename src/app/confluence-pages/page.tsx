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

interface ConfluencePage {
  id: number;
  title: string;
  url: string;
  description: string;
}

const ConfluencePagesPage: React.FC = () => {
  const { token } = useAuth();
  const [pages, setPages] = useState<ConfluencePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<ConfluencePage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/confluence-pages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch confluence pages");
      const data = await res.json();
      setPages(data);
    } catch (err) {
      setError("Failed to load confluence pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (page: ConfluencePage | null = null) => {
    if (page) {
      setEditingPage(page);
      setFormData({ title: page.title, url: page.url, description: page.description });
    } else {
      setEditingPage(null);
      setFormData({ title: "", url: "", description: "" });
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
    if (!formData.title.trim() || !formData.url.trim()) {
      setSnackbar({ open: true, message: "Title and URL are required", severity: "error" });
      return;
    }
    try {
      const url = editingPage
        ? `http://localhost:5000/api/confluence-pages/${editingPage.id}`
        : "http://localhost:5000/api/confluence-pages";
      const method = editingPage ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save confluence page");
      setSnackbar({ open: true, message: "Confluence page saved", severity: "success" });
      handleCloseDialog();
      fetchPages();
    } catch (err) {
      setSnackbar({ open: true, message: "Error saving confluence page", severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this confluence page?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/confluence-pages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete confluence page");
      setSnackbar({ open: true, message: "Confluence page deleted", severity: "success" });
      fetchPages();
    } catch (err) {
      setSnackbar({ open: true, message: "Error deleting confluence page", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Confluence Pages
      </Typography>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <TextField
          label="Search Confluence Pages"
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
                <TableCell>Title</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.url}</TableCell>
                  <TableCell>{page.description}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(page)} size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(page.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No confluence pages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingPage ? "Edit Confluence Page" : "Add New Confluence Page"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            label="URL"
            name="url"
            fullWidth
            variant="outlined"
            value={formData.url}
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
            {editingPage ? "Update" : "Create"}
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

export default ConfluencePagesPage;
