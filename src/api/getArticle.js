 function getArticle(_article_id){
  return `# \`Anaconda\` 安装与使用

  **虚拟环境**是一个可以隔离项目的\`python\`解释器和安装模块的工具，

  [image-20231002222837381](https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg)
  
  > 使用虚拟环境可以实现：一个项目对应一个python解释器及其对应模块包，不同项目独立隔离在不同的目录下。
  
  工作中常用的虚拟环境工具：anaconda（开发环境）、virtualenv、miniconda（生产环境）
  
  本文记录Anaconda的安装过程与基本使用命令。
  
  ## 01 Linux安装
  
  第一步：下载Anaconda安装包，需注意安装包存放目录。
  
  \`\`\`bash
  wget https://repo.anaconda.com/archive/Anaconda3-2023.09-0-Linux-x86_64.sh
  \`\`\`
    
  \`\`\`python
  import time

  print(time.time.now())
  \`\`\`

  ![image-20231002210654869](https://pic.dmjnb.com/pic/cbea51521d791bfe2bf0993d19ba0e46)
  
  ![image-20231002220516926](https://wallpaperm.cmcm.com/dcf1a499b17a0ce4ff0ecc11bd2ff8dc.jpg)
  
  第二步：下载的安装包是一个sh脚本文件，执行此文件即可。
  
  ![image-20231002221016264](https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg)
  
  阅读协议，按enter、空格、字母f都可...
  
  ![image-20231002221057713](https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg)
  
  同意协议
  
  ![image-20231002221213122](https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg)
  
  ![image-20231002221704155](https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg)
  
  ![image-20231002221815965](https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg)
  
  安装完成，初始化
  
  ![image-20231002222417525](https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg)
  
  ![image-20231002222837381](https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg)
  
  命令：
  
  \`\`\`bash
  eval "$(/home/zibuyu/anaconda3/bin/conda shell.bash hook)"
  \`\`\`
  
  ![image-20231002223050477](https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg)
  
  ## 02 小工具

  ### ipython
  
  ![image-20231002223447882](https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg)
  
  ### jupyter-notebook
  
  ![image-20231002223958363](https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg)
  
  ![image-20231002224040514](https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg)
  
  
  
  ## 03 常用命令
  
  
  创建环境
  \`\`\`bash
  conda create -n 虚拟环境名称 python=版本号
  \`\`\`
  
  查看所有环境
  \`\`\`bash
  conda env list
  \`\`\`
  
  激活虚拟环境
  \`\`\`bash
  conda activate 虚拟环境名称
  \`\`\`
  
  退出当前虚拟环境
  \`\`\`bash
  conda deactivate
  \`\`\`
  
  删除虚拟环境（需先退出）
  \`\`\`bash
  conda remove -n 虚拟环境名称 --all
  \`\`\`
  
  在当前虚拟环境安装第三方包
  \`\`\`bash
   conda install -c conda-forge 包名==版本号
   \`\`\`
  
  删除第三方包
  \`\`\`bash
  conda remove 包名
  \`\`\`
  
  
  其他相关命令：
  
  查看虚拟环境中安装的包：pip freeze 或者 pip list
  
  收集当前环境中安装的包及其版本：pip freeze > requirements.txt
  
  在部署项目的服务器中安装项目使用的模块： pip install -r requirements.txt
  
  
  
  > 注意：
  >
  > 创建虚拟环境时，名称不能使用特殊符号，
  >
  > 虚拟环境名称将来会作为目录名，所以也不能使用特殊符号或中文！！！
  
  提示:
  
  - 虚拟环境只会管理环境内部的模块和python解析器，对于项目源代码毫无关系；
  
  - 创建虚拟环境需要联网；
  - 创建成功后, 需要手动切换到虚拟环境中；
  - 工作在虚拟环境上, 提示符最前面会出现 “(虚拟环境名称)”。`
}

 function getArticleHeads(markdown){
  // Split the markdown content by lines and trim each line
  const lines = markdown.split('\n').map(line => line.trim());
  // Object to store titles with their hierarchy
  const titles = [];
  // Variables to keep track of current position in the hierarchy
  let currentH1 = null;
  let currentH2 = null;
  // Regex patterns for headers
  const h1Pattern = /^# (.*)/;
  const h2Pattern = /^## (.*)/;
  const h3Pattern = /^### (.*)/;
  lines.forEach(line => {
    const h1Match = h1Pattern.exec(line);
    const h2Match = h2Pattern.exec(line);
    const h3Match = h3Pattern.exec(line);
    if (h1Match) {
      currentH1 = { title: h1Match[1], level: 1, children: [] };
      titles.push(currentH1);
      currentH2 = null;  // Reset currentH2 when a new H1 is encountered
    } else if (h2Match) {
      if (currentH1) {  // Ensure there is an H1 to attach this H2 to
        currentH2 = { title: h2Match[1], level: 2, children: [] };
        currentH1.children.push(currentH2);
      }
    } else if (h3Match) {
      if (currentH2) {  // Ensure there is an H2 to attach this H3 to
        const currentH3 = { title: h3Match[1], level: 3 };
        currentH2.children.push(currentH3);
      }
    }
  });
  return titles;
}
export{
  getArticle,
  getArticleHeads,
}