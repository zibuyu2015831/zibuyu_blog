import axios from "axios";

export function getNews() {
  return axios
    .request({
      url: "https://api.mdnice.com/trendings?sex=2",
      method: "get",
    })
    .then((res) => {
      const news = res.data.data;
      const new_platforms = ["weibo", "bilibili", "toutiao", "csdn", "zhihu"];

      return news
        .filter((item) => new_platforms.includes(item.type))
        .flatMap((item) =>
          item.trendingItemList.slice(0, 3).map((new_item) => ({
            name: item.name,
            title: new_item.title.length > 25 ? new_item.title.slice(0, 25) + "..." : new_item.title,
            link: new_item.link,
            titleTag: new_item.titleTag,
          }))
        );
    })
    .catch((error) => {
      console.log("请求新闻时出现了错误： ", error);
      return [];
    });
}
