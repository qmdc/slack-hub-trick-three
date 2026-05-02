import {
    HomeOutlined,
    BulbOutlined,
    ClockCircleOutlined,
    ApiOutlined,
    WarningOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {MenuRouteObject} from "../router";
import lazyLoad from "../lazyLoad";
import React, {lazy} from "react";

const smartHome: MenuRouteObject = {
    path: "smart-home",
    label: "menu.smart home",
    icon: <HomeOutlined/>,
    children: [
        {
            path: "device",
            label: "menu.device management",
            icon: <BulbOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/SmartHome/DeviceManagement"))),
        },
        {
            path: "scene",
            label: "menu.scene editor",
            icon: <HomeOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/SmartHome/SceneEditor"))),
        },
        {
            path: "schedule",
            label: "menu.schedule task",
            icon: <ClockCircleOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/SmartHome/ScheduleTask"))),
        },
        {
            path: "linkage",
            label: "menu.linkage rule",
            icon: <ApiOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/SmartHome/LinkageRule"))),
        },
        {
            path: "energy",
            label: "menu.energy analysis",
            icon: <WarningOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/SmartHome/EnergyAnalysis"))),
        },
        {
            path: "alert",
            label: "menu.alert management",
            icon: <SettingOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/SmartHome/AlertManagement"))),
        },
    ] as MenuRouteObject[],
};

export default smartHome;