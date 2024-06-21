import {defineStore} from 'pinia'

// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useCurrentPath = defineStore('currentPath',{
    state:()=>({
        currentPath:'home'
    })
})

export default useCurrentPath