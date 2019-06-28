import withApollo from "../../util/withApollo";
import React from "react";

const withMenu = Page => {
    return class WithMenu extends React.Component {
        static displayName = `withMenu(${Page.displayName || Page.name})`;

        constructor(props) {
            super(props);
        }

        render() {
            return <Page {...props} />;
        }
    };
};
// export default withMenu;
export default withApollo(withMenu);
