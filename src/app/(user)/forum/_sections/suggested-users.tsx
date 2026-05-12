// "use client"
// import {
//     Avatar,
//     Box,
//     Button,
//     Card,
//     CardContent,
//     Divider,
//     Link,
//     List,
//     ListItem,
//     ListItemAvatar,
//     ListItemText,
//     Typography,
// } from "@mui/material"
// import { AddCircleOutline } from "@mui/icons-material"
// import { LinkedIn } from "@mui/icons-material"

// // Sample suggested users data
// const suggestedUsers = [
//     {
//         id: 1,
//         name: "Christine Lagarde",
//         avatar: "/placeholder.svg?height=50&width=50",
//         title: "President of the European Central Bank",
//         icon: null,
//     },
//     {
//         id: 2,
//         name: "Google",
//         avatar: "/placeholder.svg?height=50&width=50",
//         title: "Company",
//         icon: null,
//     },
//     {
//         id: 3,
//         name: "Bill Gates",
//         avatar: "/placeholder.svg?height=50&width=50",
//         title: "Chair, Gates Foundation and Founder Breakthrough Energy",
//         icon: <LinkedIn fontSize="small" />,
//     },
// ]

// export default function SuggestedUsers() {
//     return (
//         <Card>
//             <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                     Người bạn có thể quan tâm
//                 </Typography>

//                 <List sx={{ p: 0 }}>
//                     {suggestedUsers.map((user) => (
//                         <ListItem
//                             key={user.id}
//                             alignItems="flex-start"
//                             sx={{
//                                 px: 0,
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "center",
//                             }}
//                         >
//                             <Box sx={{ display: "flex", alignItems: "flex-start", flex: 1, overflow: "hidden" }}>
//                                 <ListItemAvatar>
//                                     <Avatar src={user.avatar} alt={user.name} />
//                                 </ListItemAvatar>
//                                 <ListItemText
//                                     primary={
//                                         <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
//                                             <Typography variant="body1" fontWeight="medium" noWrap>
//                                                 {user.name}
//                                             </Typography>
//                                             {user.icon}
//                                         </Box>
//                                     }
//                                     secondary={
//                                         <Typography
//                                             variant="body2"
//                                             color="text.secondary"
//                                             component="span"
//                                             sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
//                                         >
//                                             {user.title}
//                                         </Typography>
//                                     }
//                                     sx={{ flex: 1, minWidth: 0 }}
//                                 />
//                             </Box>
//                             <Button
//                                 variant="outlined"
//                                 size="small"
//                                 startIcon={<AddCircleOutline />}
//                                 sx={{
//                                     textTransform: "none",
//                                     borderRadius: 5,
//                                     minWidth: "90px",
//                                     flexShrink: 0,
//                                 }}
//                             >
//                                 Theo dõi
//                             </Button>
//                         </ListItem>
//                     ))}
//                 </List>

//                 <Divider sx={{ my: 2 }} />

//                 <Link href="#" color="primary" underline="none" sx={{ display: "block", textAlign: "center" }}>
//                     Xem tất cả gợi ý
//                 </Link>
//             </CardContent>
//         </Card>
//     )
// }