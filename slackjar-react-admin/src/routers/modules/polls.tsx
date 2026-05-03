import { BarChartOutlined, FileTextOutlined } from "@ant-design/icons";
import lazyLoad from "../lazyLoad";
import React, { lazy } from "react";
import { MenuRouteObject } from "../router";

const polls: MenuRouteObject = {
    path: "polls",
    label: "menu.polls",
    icon: <FileTextOutlined />,
    children: [
        {
            path: "",
            label: "menu.poll list",
            icon: <FileTextOutlined />,
            element: lazyLoad(lazy(() => import("../../pages/Polls/PollList")))
        },
        {
            path: "create",
            label: "menu.create poll",
            icon: <FileTextOutlined />,
            hidden: true,
            element: lazyLoad(lazy(() => import("../../pages/Polls/PollCreate")))
        },
        {
            path: "create/:id",
            label: "menu.edit poll",
            icon: <FileTextOutlined />,
            hidden: true,
            element: lazyLoad(lazy(() => import("../../pages/Polls/PollCreate")))
        },
        {
            path: "detail/:id",
            label: "menu.poll detail",
            icon: <FileTextOutlined />,
            hidden: true,
            element: lazyLoad(lazy(() => import("../../pages/Polls/PollDetail")))
        },
        {
            path: "statistics/:id",
            label: "menu.poll statistics",
            icon: <BarChartOutlined />,
            hidden: true,
            element: lazyLoad(lazy(() => import("../../pages/Polls/PollStatistics")))
        },
        {
            path: "share/:shareCode",
            label: "menu.poll share",
            icon: <FileTextOutlined />,
            hidden: true,
            element: lazyLoad(lazy(() => import("../../pages/Polls/PollShare")))
        }
    ] as MenuRouteObject[]
};

export default polls;