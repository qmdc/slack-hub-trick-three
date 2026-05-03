import { KeyOutlined, HistoryOutlined, BarChartOutlined } from "@ant-design/icons";
import lazyLoad from "../lazyLoad";
import React, {lazy} from "react";
import {MenuRouteObject} from "../router";

const typingtest: MenuRouteObject = {
    path: "typing-test",
    label: "menu.typing test",
    icon: <KeyOutlined/>,
    children: [
        {
            path: "test",
            label: "menu.typing test",
            icon: <KeyOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/TypingTest/TestPage")))
        },
        {
            path: "history",
            label: "menu.history",
            icon: <HistoryOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/TypingTest/HistoryPage")))
        },
        {
            path: "analytics",
            label: "menu.analytics",
            icon: <BarChartOutlined/>,
            element: lazyLoad(lazy(() => import("../../pages/TypingTest/AnalyticsPage")))
        }
    ] as MenuRouteObject[]
}

export default typingtest;