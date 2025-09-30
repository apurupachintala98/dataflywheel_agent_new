import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Spinner from "components/Spinner";

const Home = lazy(() => import("pages/Home"));


function ReactRoute() {
  return (
    <BrowserRouter>
      <Helmet defaultTitle="Data FlyWheel">
        <meta name="description" content="Data FlyWheel" />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:title" element={<Home />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default ReactRoute;
