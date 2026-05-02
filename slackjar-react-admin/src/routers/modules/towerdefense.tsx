import {
    PlaySquareOutlined,
    SettingOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import {MenuRouteObject} from "../router";
import lazyLoad from "../lazyLoad";
import React, {lazy} from "react";

const towerDefense: MenuRouteObject = {
    path: "tower-defense",
    label: "menu.tower defense",
    icon: <PlaySquareOutlined/>,
    children: [
        {
            path: "game",
            label: "menu.game play",
            icon: <PlaySquareOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/TowerDefense/GamePage"))),
        },
        {
            path: "editor",
            label: "menu.level editor",
            icon: <SettingOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/TowerDefense/MapEditor"))),
        },
        {
            path: "leaderboard",
            label: "menu.leaderboard",
            icon: <TrophyOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/TowerDefense/Leaderboard"))),
        },
    ] as MenuRouteObject[],
};

export default towerDefense;
