import api from "../Services/api.js";
import HomeTemplate from "./HomeTemplate.js"
const {ref,onMounted}=Vue;
const { useRouter, useRoute } = VueRouter;
const Home ={
    components:{

    },
    setup(){
     const route = useRoute()
     const router = useRouter()
     let userList =ref({});
     let userData = ref({
        fullName:{}
     })
     let popUp = ref({})
     const getUserList = async()=>{
        let response = await api.get('/user/user-list')
        if(response.status == 200){
            userList.value = response.data.userList
        }else{
            toast.error('some thing went wrong')
        }
     }

     const showPopUp = async(name)=>{
        popUp.value.name = name
     }
     const addUser = async()=>{
        try {
            let response = await api.post('/user/save-user',{userData:userData.value})
                if(response.status == 201){
                toast.success('data inserted')
            } 
        } catch (error) {
            if (typeof toast !== 'undefined' && toast?.error) toast.error(error?.message || 'Failed to add user')
        }
        
     }
        onMounted(async()=>{
            await getUserList()
        })

        return {
            userList,
            popUp,
            userData,
            getUserList,
            addUser,
            showPopUp
        }
    },
    template:HomeTemplate
}
export default Home;