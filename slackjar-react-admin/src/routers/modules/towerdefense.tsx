import {
    PlaySquareOutlined,
    SettingOutlined,
    TrophyOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import {MenuRouteObject} from "../router";
import lazyLoad from "../lazyLoad";
import React, {lazy} from "react";
import {Navigate} from "react-router";

const towerDefense: MenuRouteObject = {
    path: "tower-defense",
    label: "menu.tower defense",
    icon: <PlaySquareOutlined/>,
    element: <Navigate to="game" replace/>,
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
