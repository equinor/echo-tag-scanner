import React from "react";
import { Progress } from "@equinor/eds-core-react";
import styled from "styled-components";

export const StartingCameraLoading = () => {
  return (
    <CameraLoadingContainer>
      <Progress.Star />

      <span>Starting the scanner.</span>
    </CameraLoadingContainer>
  );
};

const CameraLoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 1rem;
`;
