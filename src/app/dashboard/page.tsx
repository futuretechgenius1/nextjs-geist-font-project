"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

interface SummaryCount {
  applications: number;
  configServers: number;
  adGroups: number;
  confluencePages: number;
  dbDetails: number;
}

const DashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<SummaryCount>({
    applications: 0,
    configServers: 0,
    adGroups: 0,
    confluencePages: 0,
    dbDetails: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchCounts = async () => {
      try {
        const endpoints = [
          "applications",
          "config-servers",
          "ad-groups",
          "confluence-pages",
          "db-details",
        ];

        const results = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`http://localhost:5000/api/${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
              if (!res.ok) throw new Error("Failed to fetch");
              return res.json();
            })
          )
        );

        setCounts({
          applications: results[0].length,
          configServers: results[1].length,
          adGroups: results[2].length,
          confluencePages: results[3].length,
          dbDetails: results[4].length,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchCounts();
  }, [token, router]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.username}
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3} component="div">
          <Grid item xs={12} sm={6} md={4} component="div">
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Applications</Typography>
              <Typography variant="h3">{counts.applications}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} component="div">
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Config Servers</Typography>
              <Typography variant="h3">{counts.configServers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} component="div">
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">AD Groups</Typography>
              <Typography variant="h3">{counts.adGroups}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6} component="div">
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Confluence Pages</Typography>
              <Typography variant="h3">{counts.confluencePages}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6} component="div">
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Database Details</Typography>
              <Typography variant="h3">{counts.dbDetails}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DashboardPage;
