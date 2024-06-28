/*
此函数用于将时间戳字符串转为“xx天xx时xx分xx秒”格式的字符串
*/

export function calculateTime(timestampStr) {
  // 将时间戳字符串转换为秒数
  const timestamp = parseInt(timestampStr, 10);
  
  // 如果转换失败或时间戳为负数，返回错误信息
  if (isNaN(timestamp) || timestamp < 0) {
      return "Invalid timestamp";
  }
  
  // 计算当前时间与给定时间戳的差值（单位：秒）
  const now = Math.floor(Date.now() / 1000);
  const difference = now - timestamp;
  
  // 计算天、小时、分钟和秒数
  const seconds = difference % 60;
  const minutes = Math.floor(difference / 60) % 60;
  const hours = Math.floor(difference / (60 * 60)) % 24;
  const days = Math.floor(difference / (24 * 60 * 60));
  
  // 构造输出字符串
  const result = `${days}天${hours}时${minutes}分${seconds}秒`;
  
  return result;
}

