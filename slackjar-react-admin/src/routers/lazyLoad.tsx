import React, {Suspense, ComponentType, LazyExoticComponent} from "react";
import PageLoading from "../components/PageLoading";

interface LazyLoadProps {
    children: React.ReactNode;
}

const LazyLoadWrapper: React.FC<LazyLoadProps> = ({children}) => {
    return (
        <Suspense fallback={<PageLoading />}>
            {children}
        </Suspense>
    );
};

const lazyLoad = <P extends object>(Component: LazyExoticComponent<ComponentType<P>>): React.ReactElement => {
    return React.createElement(LazyLoadWrapper, null, React.createElement(Component));
};

export default lazyLoad;
