import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Options = () => {

  return (
    <>
      Option Page
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
