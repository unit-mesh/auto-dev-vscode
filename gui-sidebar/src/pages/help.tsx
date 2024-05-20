import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Hr,
  lightGray,
  vscBackground,
  vscForeground,
} from "../components";
import KeyboardShortcutsDialog from "../components/dialogs/KeyboardShortcuts";
import { useNavigationListener } from "../hooks/useNavigationListener";
import { postToIde } from "../util/ide";

const ResourcesDiv = styled.div`
  margin: 4px;
  border-top: 0.5px solid ${lightGray};
  border-bottom: 0.5px solid ${lightGray};
`;

const IconDiv = styled.div<{ backgroundColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  padding: 12px;

  & > a {
    color: ${vscForeground};
    text-decoration: none;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
  }

  &:hover {
    background-color: ${(props) => props.backgroundColor || lightGray};
  }
`;

const TutorialButton = styled(Button)`
  padding: 2px 4px;
  margin-left: auto;
  margin-right: 12px;
  background-color: transparent;
  color: ${vscForeground};
  border: 1px solid ${lightGray};
  &:hover {
    background-color: ${lightGray};
  }
`;

function HelpPage() {
  useNavigationListener();
  const navigate = useNavigate();

  return (
    <div className="overflow-y-scroll overflow-x-hidden">
      <div
        className="items-center flex m-0 p-0 sticky top-0"
        style={{
          borderBottom: `0.5px solid ${lightGray}`,
          backgroundColor: vscBackground,
        }}
      >
        <ArrowLeftIcon
          width="1.2em"
          height="1.2em"
          onClick={() => navigate("/")}
          className="inline-block ml-4 cursor-pointer"
        />
        <h3 className="text-lg font-bold m-2 inline-block">Help Center</h3>
        <TutorialButton
          onClick={() => {
            postToIde("showTutorial", undefined);
          }}
        >
          Open tutorial
        </TutorialButton>
      </div>

      <h3
        className="my-0 py-3 mx-auto text-center cursor-pointer"
        onClick={() => {
          navigate("/stats");
        }}
      >
        View My Usage
      </h3>
      <Hr className="my-0" />
      <h3 className="my-3 mx-auto text-center">Resources</h3>
      <ResourcesDiv className="border">
        <IconDiv backgroundColor={"#1bbe84a8"}>
          <a
            href="https://vscode.unitmesh.cc/quick-start"
            target="_blank"
          >
            <svg
              width="42px"
              height="42px"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-2.2 -2 28 28"
              fill={vscForeground}
            >
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
            Documentation
          </a>
        </IconDiv>
        <IconDiv backgroundColor={"rgba(4,74,48,0.66)"}>
          <a
            href="https://github.com/unit-mesh/auto-dev/blob/master/LICENSE"
            target="_blank"
          >
            Open Source LICENSE
          </a>
        </IconDiv>
        <IconDiv>
          <a
            href="https://github.com/unit-mesh/auto-dev/issues/new/choose"
            target="_blank"
          >
            <svg
              width="42px"
              height="42px"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-1.2 -1.2 32 32"
              fill={vscForeground}
            >
              <path
                d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
            </svg>
            GitHub Issues
          </a>
        </IconDiv>
      </ResourcesDiv>

      <KeyboardShortcutsDialog/>
    </div>
  );
}

export default HelpPage;
