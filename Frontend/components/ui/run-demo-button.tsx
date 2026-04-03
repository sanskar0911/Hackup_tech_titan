"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";

export default function RunDemoButton() {
  const handleRunDemo = async () => {
    await axios.post("http://localhost:5000/api/demo/run");
  };

  return (
    <Button onClick={handleRunDemo} className="bg-red-600">
      🚀 Run Demo
    </Button>
  );
}