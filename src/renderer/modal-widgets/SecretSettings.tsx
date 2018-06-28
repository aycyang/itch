import { createRequest } from "butlerd";
import { actions } from "common/actions";
import { call, messages } from "common/butlerd";
import { Dispatch, RootState } from "common/types";
import React from "react";
import Button from "renderer/basics/Button";
import { doAsync } from "renderer/helpers/doAsync";
import { hook } from "renderer/hocs/hook";
import { ModalWidgetDiv } from "renderer/modal-widgets/styles";
import styled from "renderer/styles";
import { ModalWidgetProps, modalWidgets } from "./index";

const ControlsDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .control {
    margin: 12px 0;
  }

  label {
    padding: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-left: 2px solid ${props => props.theme.prefBorder};
  }

  input[type="checkbox"] {
    margin-right: 0.4em;
  }
`;

class SecretSettings extends React.PureComponent<Props> {
  render() {
    const { status } = this.props;

    return (
      <ModalWidgetDiv>
        <ControlsDiv>
          <label className="control">
            <input
              type="checkbox"
              value="Redux logging"
              checked={status.reduxLoggingEnabled}
              onChange={this.toggleReduxLogging}
            />
            <span>Enable redux logging</span>
          </label>
          <Button
            className="control"
            primary={true}
            icon="repeat"
            onClick={this.onReload}
            label="Reload entire page"
          />
          <Button
            className="control"
            primary={true}
            icon="earth"
            onClick={this.onReloadLocales}
            label="Reload locales"
          />
          <Button
            className="control"
            primary={true}
            icon="bug"
            onClick={this.onViewAppState}
            label="View app state"
          />
          <Button
            className="control"
            primary={true}
            icon="palette"
            onClick={this.onGPUFeatureStatus}
            label="View GPU feature status"
          />
          <Button
            className="control"
            primary={true}
            icon="bug"
            onClick={this.onBadButlerdCall}
            label="Call non-existent butlerd endpoint"
          />
          <Button
            className="control"
            primary={true}
            icon="close"
            onClick={this.onExpireAll}
            label="Expire all data in local database"
          />
          <Button
            className="control"
            primary={true}
            icon="bug"
            onClick={this.onOpenCrashy}
            label="Open crashy tab"
          />
        </ControlsDiv>
      </ModalWidgetDiv>
    );
  }

  onReload = () => {
    window.location.reload();
  };

  onReloadLocales = () => {
    const { dispatch } = this.props;
    dispatch(actions.reloadLocales({}));
  };

  onViewAppState = async () => {
    const chromeStore = (await import("renderer/store")).default;
    const { dispatch } = this.props;
    dispatch(
      actions.openModal(
        modalWidgets.exploreJson.make({
          wind: "root",
          title: "Redux app state",
          widgetParams: {
            data: chromeStore.getState(),
          },
          fullscreen: true,
        })
      )
    );
  };

  onGPUFeatureStatus = () => {
    // sic.: the typings are wrong, they have
    // `getGpuFeatureStatus` but the correct casing is
    // `getGPUFeatureStatus`. See https://github.com/electron/electron/issues/10788
    // FIXME: remove workaround once upgrading to electron 1.8.x
    const app = require("electron").remote.app as any;
    const data = app.getGPUFeatureStatus();
    const { dispatch } = this.props;
    dispatch(
      actions.openModal(
        modalWidgets.exploreJson.make({
          wind: "root",
          title: "GPU feature status",
          widgetParams: {
            data,
          },
        })
      )
    );
  };

  onBadButlerdCall = () => {
    const FakeRequest = createRequest<{}, {}>(
      "This.Is.Definitely.Not.A.Butlerd.Method"
    );

    doAsync(async () => {
      let e: Error;
      try {
        await call(FakeRequest, {});
      } catch (ee) {
        e = ee;
      }

      const { dispatch } = this.props;
      dispatch(
        actions.openModal(
          modalWidgets.showError.make({
            wind: "root",
            title: "test butlerd internal error",
            message: "This is a test butlerd error",
            detail: "It's fun to snoop!",
            widgetParams: {
              rawError: e,
              log: "no log",
            },
            buttons: [
              {
                label: ["prompt.action.continue"],
              },
            ],
          })
        )
      );
    });
  };

  onExpireAll = () => {
    doAsync(async () => {
      await call(messages.FetchExpireAll, {});
    });
  };

  onOpenCrashy = () => {
    const { dispatch } = this.props;
    dispatch(actions.navigate({ wind: "root", url: "itch://crashy" }));
    dispatch(actions.closeModal({ wind: "root" }));
  };

  toggleReduxLogging = () => {
    const enabled = !this.props.status.reduxLoggingEnabled;
    const { dispatch } = this.props;
    dispatch(
      actions.setReduxLoggingEnabled({
        enabled,
      })
    );

    if (enabled) {
      dispatch(actions.openDevTools({ forApp: true }));
    }
  };
}

export interface SecretSettingsParams {}

interface Props extends ModalWidgetProps<SecretSettingsParams, void> {
  params: SecretSettingsParams;
  dispatch: Dispatch;

  status: RootState["status"];
}

export default hook(map => ({
  status: map(rs => rs.status),
}))(SecretSettings);
