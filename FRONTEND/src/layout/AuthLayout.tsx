// import React from "react";
// import { Outlet } from "react-router-dom";
// import { Layout, Flex } from "antd";
// import { AuthHeader } from "../components/AuthHeader";

// const { Content } = Layout;

// export default function AuthLayout(): React.JSX.Element {
//   return (
//     <Flex 
//     vertical 
//     // style={{ minHeight: "100vh" }}
//     >
//       <AuthHeader />
//       <Content 
//       // style={{ flex: 1, padding: "24px" }}
//       >
//         <Outlet />
//       </Content>
//     </Flex>
//   );
// }

import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { AuthHeader } from "../components/AuthHeader";

const { Content } = Layout;

export default function AuthLayout(): React.JSX.Element {
  return (
    <Layout 
    style={{ minHeight: "100vh" }}
    >
      <AuthHeader />
      <Content 
      style={{padding: "20px"}}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}