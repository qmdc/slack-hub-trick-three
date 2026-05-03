import {
    HomeOutlined,
    BulbOutlined,
    ClockCircleOutlined,
    ApiOutlined,
    WarningOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {MenuRouteObject} from "../router";
import DeviceManagement from "../../pages/SmartHome/DeviceManagement";
import SceneEditor from "../../pages/SmartHome/SceneEditor";
import ScheduleTask from "../../pages/SmartHome/ScheduleTask";
import LinkageRule from "../../pages/SmartHome/LinkageRule";
import EnergyAnalysis from "../../pages/SmartHome/EnergyAnalysis";
import AlertManagement from "../../pages/SmartHome/AlertManagement";

const smartHome: MenuRouteObject = {
    path: "smart-home",
    label: "menu.smart home",
    icon: <HomeOutlined/>,
    hidden: true,
    children: [
        {
            path: "device",
            label: "menu.device management",
            icon: <BulbOutlined/>,
            element: <DeviceManagement />,
        },
        {
            path: "scene",
            label: "menu.scene editor",
            icon: <HomeOutlined/>,
            element: <SceneEditor />,
        },
        {
            path: "schedule",
            label: "menu.schedule task",
            icon: <ClockCircleOutlined/>,
            element: <ScheduleTask />,
        },
        {
            path: "linkage",
            label: "menu.linkage rule",
            icon: <ApiOutlined/>,
            element: <LinkageRule />,
        },
        {
            path: "energy",
            label: "menu.energy analysis",
            icon: <WarningOutlined/>,
            element: <EnergyAnalysis />,
        },
        {
            path: "alert",
            label: "menu.alert management",
            icon: <SettingOutlined/>,
            element: <AlertManagement />,
        },
    ] as MenuRouteObject[],
};

export default smartHome;