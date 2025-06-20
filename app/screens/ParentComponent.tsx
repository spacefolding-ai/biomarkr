import React, { useEffect, useState } from "react";
import BiomarkersScreen from "./BiomarkersScreen";
import LabReportsScreen from "./LabReportsScreen";

const ParentComponent: React.FC = () => {
  const [biomarkers, setBiomarkers] = useState([]);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const newBiomarkers = await fetchBiomarkers();
    const newReports = await fetchLabReports();
    setBiomarkers(newBiomarkers);
    setReports(newReports);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 2000);
  };

  return (
    <>
      <BiomarkersScreen
        biomarkers={biomarkers}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <LabReportsScreen
        reports={reports}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </>
  );
};

const fetchBiomarkers = async () => {
  // Simulate an API call
  return [
    {
      id: "new1",
      marker_name: "New Marker 1",
      value: 5,
      unit: "mg/dL",
      report_date: "2023-10-01",
      abnormal_flag: "normal",
    },
    {
      id: "new2",
      marker_name: "New Marker 2",
      value: 3,
      unit: "mg/dL",
      report_date: "2023-10-02",
      abnormal_flag: "high",
    },
  ];
};

const fetchLabReports = async () => {
  // Simulate an API call
  return [
    {
      id: "new1",
      laboratory_name: "New Lab 1",
      description: "New Description 1",
      report_date: "2023-10-01",
      extraction_status: "pending",
    },
    {
      id: "new2",
      laboratory_name: "New Lab 2",
      description: "New Description 2",
      report_date: "2023-10-02",
      extraction_status: "extracted",
    },
  ];
};

export default ParentComponent;
