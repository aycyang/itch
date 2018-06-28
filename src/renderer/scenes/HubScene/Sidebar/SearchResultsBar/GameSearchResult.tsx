import classNames from "classnames";
import { actions } from "common/actions";
import { Game } from "common/butlerd/messages";
import { ambientWind, urlForGame } from "common/util/navigation";
import React from "react";
import Cover from "renderer/basics/Cover";
import Filler from "renderer/basics/Filler";
import { whenClickNavigates } from "renderer/helpers/whenClickNavigates";
import { hook } from "renderer/hocs/hook";
import GenericSearchResult from "renderer/scenes/HubScene/Sidebar/SearchResultsBar/GenericSearchResult";
import styled, * as styles from "renderer/styles";
import { Dispatch } from "common/types";

const GameSearchResultDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 4px 8px;
  padding-left: 12px;

  flex-shrink: 0;

  border-left: 1px solid transparent;

  &.chosen {
    background-color: ${props => props.theme.sidebarEntryFocusedBackground};
    border-color: ${props => props.theme.accent};
    cursor: pointer;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
  }

  .cover-container {
    flex-shrink: 0;
    width: ${80 * 1}px;

    display: flex;
    flex-direction: row;
    align-items: flex-start;

    .cover {
      width: 100%;
    }
  }
`;

const SectionDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  overflow-x: hidden;
  ${styles.singleLine()};
  line-height: 1.4;
`;

const TitleDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Title = styled.span`
  font-size: ${props => props.theme.fontSizes.smaller};
  ${styles.singleLine()};

  &.chosen {
    font-size: ${props => props.theme.fontSizes.larger};
  }
`;

const ShortText = styled.span`
  font-size: ${props => props.theme.fontSizes.smaller};
  color: ${props => props.theme.secondaryText};
  margin-right: 8px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  word-wrap: break-all;
  white-space: normal;
`;

class GameSearchResult extends GenericSearchResult<Props> {
  render() {
    const { game, chosen } = this.props;
    const { title, stillCoverUrl, coverUrl } = game;

    const resultClasses = classNames("game-search-result", {
      chosen: chosen,
    });

    return (
      <GameSearchResultDiv
        className={resultClasses}
        onMouseDown={this.onClick}
        data-game-id={game.id}
        ref="root"
        onMouseEnter={this.onMouseEnter}
      >
        <SectionDiv>
          <TitleDiv>
            <Title className={classNames({ chosen })}>{title}</Title>
            <Filler />
          </TitleDiv>
          {chosen ? (
            <TitleDiv>
              <ShortText>
                {game.shortText && game.shortText !== ""
                  ? game.shortText
                  : "No description"}
              </ShortText>
              {game.user ? (
                <ShortText>
                  By {game.user.displayName || game.user.username}
                </ShortText>
              ) : null}
            </TitleDiv>
          ) : null}
        </SectionDiv>
        {chosen ? (
          <>
            <Filler />
            <div className="cover-container">
              <Cover
                hover={false}
                className="cover"
                gameId={game.id}
                coverUrl={coverUrl}
                stillCoverUrl={stillCoverUrl}
              />
            </div>
          </>
        ) : null}
      </GameSearchResultDiv>
    );
  }

  onClick = (ev: React.MouseEvent<any>) => {
    whenClickNavigates(ev, ({ background }) => {
      if (background) {
        ev.preventDefault();
      }

      const { game, dispatch } = this.props;
      dispatch(
        actions.navigate({
          wind: ambientWind(),
          url: urlForGame(game.id),
          background,
        })
      );
    });
  };

  onMouseEnter = () => {
    const { dispatch } = this.props;
    dispatch(
      actions.searchHighlightOffset({
        offset: this.props.index,
        relative: false,
      })
    );
  };

  getNavigateAction() {
    const { game } = this.props;
    return actions.navigate({
      wind: ambientWind(),
      url: urlForGame(game.id),
    });
  }
}

interface Props {
  game: Game;
  chosen: boolean;
  active: boolean;
  index: number;
  dispatch: Dispatch;
}

export default hook()(GameSearchResult);
