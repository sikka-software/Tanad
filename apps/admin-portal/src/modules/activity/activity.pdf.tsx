import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

import type { ActivityLogListData } from "./activity.type";

// Define styles
// Note: Font registration might be needed for non-Latin characters (like Arabic)
// See: https://react-pdf.org/fonts
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica", // Default font
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  table: {
    display: "flex", // Changed from "table" which is not directly supported in this context
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flexGrow: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flexGrow: 1,
    fontSize: 9,
  },
  // Define column widths (adjust percentages as needed)
  colTimestamp: { width: "18%" },
  colUserEmail: { width: "20%" },
  colAction: { width: "10%" },
  colTargetType: { width: "12%" },
  colTargetName: { width: "20%" },
  colDetails: { width: "20%", wordWrap: "break-word" },
});

interface ActivityLogPDFDocumentProps {
  data: ActivityLogListData[];
  title?: string;
}

// Create Document Component
export const ActivityLogPDFDocument: React.FC<ActivityLogPDFDocumentProps> = ({ 
  data, 
  title = "Activity Log Report" 
}) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.title}>{title}</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow} fixed>
          <Text style={[styles.tableColHeader, styles.colTimestamp]}>Timestamp</Text>
          <Text style={[styles.tableColHeader, styles.colUserEmail]}>User</Text>
          <Text style={[styles.tableColHeader, styles.colAction]}>Action</Text>
          <Text style={[styles.tableColHeader, styles.colTargetType]}>Type</Text>
          <Text style={[styles.tableColHeader, styles.colTargetName]}>Target</Text>
          <Text style={[styles.tableColHeader, styles.colDetails]}>Details</Text>
        </View>
        {/* Table Body */}
        {data.map((log) => (
          <View key={log.id} style={styles.tableRow} wrap={false}>
            <Text style={[styles.tableCol, styles.colTimestamp]}>
              {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
            </Text>
            <Text style={[styles.tableCol, styles.colUserEmail]}>
              {log.user_full_name || log.user_email || "N/A"}
            </Text>
            <Text style={[styles.tableCol, styles.colAction]}>{log.action_type || "N/A"}</Text>
            <Text style={[styles.tableCol, styles.colTargetType]}>{log.target_type || "N/A"}</Text>
            <Text style={[styles.tableCol, styles.colTargetName]}>
              {log.target_name || log.target_id || "N/A"}
            </Text>
            <Text style={[styles.tableCol, styles.colDetails]}>
              {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || "N/A"}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
); 