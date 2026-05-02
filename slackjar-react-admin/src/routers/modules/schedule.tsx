import {
    CalendarOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    LayoutOutlined,
} from "@ant-design/icons";
import {MenuRouteObject} from "../router";
import lazyLoad from "../lazyLoad";
import React, {lazy} from "react";

const schedule: MenuRouteObject = {
    path: "schedule",
    label: "menu.schedule management",
    icon: <CalendarOutlined/>,
    children: [
        {
            path: "weekly-view",
            label: "menu.weekly view",
            icon: <CalendarOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/Schedule/WeeklyView"))),
        },
        {
            path: "pomodoro",
            label: "menu.pomodoro timer",
            icon: <ClockCircleOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/Schedule/PomodoroTimer"))),
        },
        {
            path: "task-list",
            label: "menu.task list",
            icon: <FileTextOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/Schedule/TaskList"))),
        },
        {
            path: "templates",
            label: "menu.templates",
            icon: <LayoutOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/Schedule/Templates"))),
        },
        {
            path: "statistics",
            label: "menu.statistics",
            icon: <BarChartOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/Schedule/Statistics"))),
        },
    ] as MenuRouteObject[],
};

export default schedule;
