<script setup>
import { ref } from "vue";

const statusMessage = ref("哈囉你好嗎 衷心感謝 珍重再見 期待再相逢");
const followerCount = ref("66666666");

// 這裡貼你的圖片網址
const petAvatar = ref(
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxESEhUSEBEWFhUXFxYXGRgXFxYaGBoaFRgaGBUXGhcdHyggGh0lGxUYITIiJSkrLi4uGB8zODMtNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABgcFCAIDBAH/xABKEAABAwIEAwUDBwkECQUAAAABAAIDBBEFEiExBkFRBxMiYXEygZEUI0JSobHRM2JygpKTweHwCFODohUXJTRDRGOysyRzhKOk/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKNREQEREBERAREQERe7D8IqJ/yMTnDrazR6uOg+KDworE4b7JKypcBI9sTTubFxt6aKz8K7DsNjt3zpZj+c7KPg22nrdBrYuxkLjs0n0BW3VBwDhkP5OjjHmW3P2rLRYLTN9mCMfqhBpe+Fw3aR6grrW6suDUzvagjP6oWKruBcMm/KUcR/VAKDT9Fsvi/YlhkoPdd5C7q11x+y6+npZV3xD2H4hDd1K9lQ0X0Hgk/ZJsfcUFWIvfiODVNO4tngkjcNw5pFv5LwICIiAiIgIiICIiAiIgIiICIiAiL6Ag+LLYFw/PVH5ttm83u0aPfzPkFJOFeBnSZZasFrDq1mud/o0alXFwzw2TlyMEbG+Qv+A9AghHDXZtE2xcwyO6vGnuZ+KtbBOEYYwDI25Gw0sPQDQe5Z+jomRizR7+ZXpQcIomtFmgD0XNEQEREBERAREQdNTSRyC0jGuH5wB+9Vzxn2O0VUHSUoFPKdfD+TJ828vcrMRBpvxTwtV4fKY6qMt+q4ascOrXLCLdPG8Gp6uIw1MbXsPIjbzB5Fa8do3ZNPQ5p6W81Pubavj/SHMeYQVmiIgIiICIiAiIgIiICIvoCD6xpJAAuToANyrO4J4JMdpqlo7zdrCMxb55dr+ZXd2f8AB3ctFVVWY4+wDq4A9ByJ67q3uGcIzjvHMys5A+07zPQIOvh3h8nxvFgdydXHyv8A0FMIog0BrRYBcmi2gX1ARFxLwNyEGOxfG4qbL3ptm2PLTzXjj4tpXbPH7TfxWSfiNMTlM0RPQvZf4XXOShgePFGxw/RaUHRT41C7nb1XyTG4Q7Lf3hY7H8Hc2PNRxNLm/wDC0aHDnZ3J3rp6bqNUk7JhmyOa9t2uY9uWRhO7XDl7rg7goLApaxkl8hvZehQLCoe4uIAQ525JLnHyu65svfM2uebCJ5H1nPYxv35v8qCWd4L2uL9LrkorHwxM/WWpdEekGU/F8jCT8AshRRVcGkjm1DPrAFko/UJLXe4t9EGaRdNNUZxcNc3yc0tPwK7kBfHAHQ7L6iCne0zsgjmD6nDgGS6udF9F/M5fqny2VAzROY4tcCHAkEHQgjcFbwKoO2bs2FQ11dRM+eaLysH02jdwH1h9qDXtF9IXxAREQEREBERAU17N+He/k+USMvHGdM2jS/lfqB0UWwjDn1EzIY/aeQPIdSfQK+cGomxRshgsWss3vD+TB55R9N1+aCR8PYQZpM77lrfpEb+TW/RCnTWgCw2C8mE0Qhiay5cdyTuSd/RexAXixetdDE57InSv2ZGzdzj7IudGjzOgXtRBXs3DOL13ira80jDqIaQ+JvTNMbE+drBYCv7FpZCf9qSvHISgv312J6q4UQUHUdimIN0ZU07x5syrpg4V4jwoCSnkD42uzd2x92aixvGQBbTkVsEuE0Yc0tPMWQYTgviH5dStmczJIPDIz6rxuFmJqVj75mg3Fr7G3S41WD4dIjkkisASb+ZI0upEgx9Ng0Ebs7WeLq5z3H/MSsTxvxlFhzG3Y6WaTSOGMXe625tyaLjXzUmXWYGZs+UZrWzWF7b2v0ugoWt7ccQjcQ+hZHr7L84PpqAu6g7fpL/P0bbcyx5v7gRb7Vej4GHdoPqAsVWcKYfKby0VO89XRRk/EhBH+Gu1XDKyw77uZCQMkvhuT0dsVNopGuAc1wcDsQQQfeFB6zsiwd9y2mdG4845ZBa/RpcWgeVl04bwBVUDg7DMSkyC/wAxVN7yJ3lmblLPUAlBYKLy4bNK+MGeIRyahzQ/O3Tm19hcHzAPkvUgIiINcO2/gT5JN8sp22glPjAGkch39Gu+9VWt18Ww2KphfBO0Oje0tcD58/Val8ecKSYbVup33cz2o3ke0w7e8bFBHEREBERARFyY0kgDUk2HvQT/ALLMHa5z53guI8LGjn1JPIK6eGaIOnb3hBLBcMHss6afxKifD1I2mpWQxnIAB3kltXPPtBnU30urA4JpnNY5+QMa46A6vNt3OPn0QSVERAWM4gx+moojNVStjaL2v7TiOTW7uOo+KyaqTtA7NaiepNa2V1UL3+TyG2Vm+RhBGm+gsdtSUHdS8d4pichbhNII4L2+UTg20OpA5+gv52XVj2Lso5e5qKysrKkAOeIntiZFfa+UAanZpuVJ+HOLoGMbBPSSUJYA0Mcx3dAAfRkAsB+kG+9UhWVskNdV9+SZJZS9jwbsIJIDg4aeyRY8tedkFi8NcczSVIpjLNHO/wBhlUInRPIFzGJI7FpIFrm+vLkrKwPF/lDXB0bopYzlkjdu0nYg7Oa6xIcN9ehWutRTkyUmR15hNG9pHssa1wcXl2wAte56HRWzxDjBkqqeowwmQxgsqHtyiF0L9m94fbeHC7Q29rv2ug75aj/akFvryMJHnGXWP7CnqqjA89Ri0AaCGQiSodtu5romBwG18zjffRWugIirvHMaxSrrX4fQNFKyMXkqJGhzy0m2aNh0DdwDqTofCgsJ7wBckAdTouuKrjcbMka49A4H7lXOOcGYVh9NLWYg+pqstiXSzyZnOJsGtaxzWm5Oxv5ncqHYdxRhsjmhmBBrRu6KoLZAORbZrbnr4hrzKC/UVbQcT1FLC2rhe6vw7xZyQfllPbcOJNpGtsb5gHa6u01nWC4xT1cTZ6aVskbtiPtBG4PkdUHvREQEREBVv258NCqoDOxvzlP4x1LPpD+KshddTA2RjmPF2uaWkeThY/eg0gRZPibCnUlXPTO3jke31APhPvbY+9YxAREQFn+BaETVsTSwvDTnLRzyatBPIZst/JYBTrsmo888zzIWNZHZxGhIcds30fZ3GqC02El1gBJKNNPycXl5n7fRWDw1TZIG3eXudq48r9AOQHRQNgBbZo7qHYWBD3+g3APxKsnD4w2NjWtygNHh6IPQiIgIiIPhHVYyr4eo5bd5TRG23hA39FlEQYKDg7D2EFtJELG48Nxe972Om6xXG1c1jWwtDQBy2AsL7DkB7tVKq+qEUbnnkNhuTyAVJcd4qWwz1DhZz/CBmv4joMx2Nt+7b4RqTcoJf2NxGVlTWuFzNMWMde/zcIygeQzZz71YyjPZthXyXDaaLLlPdhzh+c/xOPxKkyAsTi2CCV7Z4nmKoYLNkAvcHdj27Pb5fCyyyIKu7UoKqsw99PNCY5o3slDm3dBKGaOs8fkzZ5NnjdvNVbhtR3TcssMzS2wcBE52vQECxvyO21ltGQsTWcN0kjsxiyv+vE58T9NrvjLXH4oIX2MYNUxw1M1S1zGVEgcyGQWIABDnuadi4ECx5NChHGUL+H8TimoZHMpZiHvhDrt0daRuTpb2SdtRsFcM/B9K8We6qcOhrq4j4d8vE3s1wm9zSl5vf5yaokFxzs+Qi6CVxvuAeoB+K5LixoAAAsBoB6LkgIiICIiDXT+0TgvdV0VU0aTx2d+nF4ST+oWD9Uqp1sp/aCw3vcNEttYZWu9zvCfvv7lrWgIiICsvshgYGzSvGY5mtYwfScBfbyvudAq0Vs9kVxTyd20Zy+2YjRosNT19EE/hJ71mbxSkizBs0X3J/irKbsq6wRvzrRHqMwzyO1Lz5f1YKxkBERAREQF11E7Y2ue9wa1oLnEmwAAuSSuxVD/aD4pdDBHQQus+cF8ljqImmzW26Pdf3MI5oPXjXHVPXs/9L3pja4glzSxryOQO7vQa9bBQjH6J09RQQFwJknb4eWVuugGlrE7aeu68WaqZRU5pobPDcuUxi4G5IY4+M31JIy7LnQzTVeWORpgrIXd9HKGuAJA1LnXJLjax1y2aLdEGybWgAAaACw9AjXA7EH0VIYXxfW1MeWoqHBmVwkeGNa8PDsuVttBz1y36arrxLtAdQuMUUEoygAAaN1F/G487EG2+upvdBbvEPEdPRNa+pL2sLgC8Rvcxl9A57gLNF9NeoWUhla9ocxwc1wBDgQQQdQQRoQQqbwPjh2KR1NNUWEfd2f426scDdwcALEa+QsN7rE/2feKTHK6glc4sku6K7vC1zfaaGnbNvp0QX6iIgIiICIiAiIgIiIIz2l0ffYZVMAue6cR6t1WoS3Vx1gNPMDsY33/ZK0rKD4iIgK1eyEF9PMwuysEgLtbEjKNL8h1VVKxeyKdodO19z7BDB9I3IAtz+5BbWHyXfGW+CJrm25ZtdPQKxFWXehjmvm1fcZY2629Op89lZcZuAfIIOSIiAiIgKkMXw4VnEFRK85o6YQtA5A92CG/tl7requ9RPgjB291JUTR/O1FRNOb8g5+WIendsafeUGOrMAc5mcMsXC1wNdNrjmPJYKopIM5ifOWluXPm8IudRmeRlBI5X0GwWY7T+MpaKWkpqeSOJ07jnlkbdkcYIBdva4vfXTRevDqwSgCDHhK9p8WZtK5rt7gta1pGvRyDjh3C2Zoc1rNdQ4EegItzA5rK03CUTQA+xAvpYc99TuT1WKlwqrOYiGhqL/3TpKZx/Sc3PmXRHFicXijwqIlurc+ISyAG27WPYQD5iyCRS8IURjdH3DQHgtcQBch2hBPTyWv3FmGSYLisb2giNr45YnAaGMWa9vTMBcEeYPNXzwTxUa1sjJojDUwODZojrlJvlIPMGx+BXR2ocPR1tBMHMDpI2OfGeYcB16IJRSVAkY2Ruzmhw9CLrtWA4BmL8No3nd0ER+LQs+gIiICIiAiIgIiIMZxM+1JUHpE//tK0vW33aRV91hlU/wD6Th8RZagoCIiApn2U1L21pZHlzSRuaC7YEEG9uegOnNQxe/Aa/uKiKa5s14Lrb5To8DzLSQg2BhisXZHZnfTmdsPJvL3DQKfcNVbZKdpaS7L4cxvrbnc7+qgIyuYHv8MItkYPpA+ySBvfopLwjXODy2SzQ8eBnMZevnZBLkREBERAXxrQBYaAL6vjnWBPRBT3ElWZcYqZG6/JYYoWtcAR3k7xcgehHxXlBZJGx0scbj8mikN2NsX1D7MJFv8ApuHxWKo6hzoq2qG89Y8tPPJDmcP/ABLIYSPDldyloacf4MMUjh+1I9B68Uo6aLOWRFuQH8nI9lyI3SWs0j6oHvXrjc+MuibNUNYHhhAmkN/mRK83JJGjrLHYiRI3p3sr/gZYoR9jnLujnu95POesPuii7kf9qDL9m1QwYjVMaC0SU1K9oJJ0bnBuTufGNVZdTFnY5n1mlvxFlUXA02XGIR/e0Fve0xn7gVcKCNdnUZZQQxm/zWeLXpE8sH2NUlXlw6n7trha13vd+04n+K9SAiIgIiICIiAiIgrXt9r+7wssvYyyMYPd4j9jStZld39pPEgXUtMCNM8jhfUbNZce9ypFAREQEREF29n2MGoo42huaWLwXOzQPZcfdopXhzskocw53g+OQ7C30G/gPeqX7M8WMVT3JflZN4SfMbW6X6q43Tgju4SGsbo6TkPJvV3mgsynlD2hw5i67FHuE67MzJrbdt97f1qpCgIiIC6K9+WN5PJjj8AV3rAcfSFuG1rmkgimmII5HIdUFLYdQv8A9HUsbCS5zJprcz3gyH/yFS7D+HKuRjZI4j/vtTKbua3ws72OM2cRcHKy1uRvsvZwFBTCWmBlYXMpsjWfnOs7fYmzdlZoCCt28EVJigLy3OwQktza3bIJH67H+Sj9JZxFticTdf8A+Q8D71dKjnEnDzJPno22kYyVthoCJLOdcczcXv6oKu4YkP8ApfCCNn00gPnaGQ/e0K8nusCTyF/gqMwIOZieC5gQe6kaQfOOQfxV3VrSY3AbkEIO5jrgHrqvq4xiwA6ALkgIiICIiAiIgLjI8NBJNgBcnyG65KA9s3Ewo8PexrrSz3jb1sfaPwQa9ce44a2vqKi+jnkM8mM8LPsaD6kqPoiAiIgIiIOTHkEEGxGoKvnhLFW1VLHNbM4eDumiwD28z99zsCqEUq7PuJXUc+Um0cvhdfZp+i/3c/JBe9DUGJ7S595Cb2G2nIDkPNT6nmD2hw2IVXUviBc11mbulO7/ANHo1S7hTEr+A3DT7F/65oJOiIggParjFRDSzmncWOawHM02IuRdwKzFXAcSwpzIpQDUQFok3HiFrnyK83GmHiUPY8eGRhbf3KC8DHGMOjNM1kEkAcS3PI67bnxZbDY+1bqT1QZjBMCp442fKnVVFPGLHK5wgLowW95ESHM1F7N0Ovs3Xthx4/8AL401wH0aukdr6yN7q3rYrLVXE1S2K7YonSdC8tZbn4rX0Uef2i17IzK6hic0EWDJXl7xfxOY3J4gBz52QZOi4vqS6z6nCHj82qkjdfloWOUghq8Qdr3FJa19KqU3/wDzi3rqvPh2JYbiUBkAikY5pDw9oBbp4muvqCFH6PAKCN7m0GKmndtZj4HAD6oDweaDz4vh9a7GcNlqIoGsDpwO5dI8jLC8+MuY0AagDTcqzFBqzFKHBonS1FXJUTOGmeTPK820axg8LAT0ACy3BUdW6N9TXEtlnIeIfowMA8EY/OsbuPM+lkEjREQEREBERAREQdc8zWNL3kBrQSSdgBuVqf2n8WnEq10jSe5ZdkQ8hu737+llYfbtx7vhtM//AN9wP/1/iqNQEREBERAREQEREFi8A8YgZaarLnBukO1s3Jrv4E6K0GSua5rnnNKdWMadGjr+Lj7lrUrB4J46MYFPUOsHOA783Lg22xvvbQDpdBslg+IiZmts49oDqsgqwwjGgx7XQas+Jf1cejfMqxcOrmTxiSM3B/ooOdXStkGV4XgOARdXfFZZEEdr+HfD4Dm6tdbVQjEMNkgkIdG85trh2TW9g99y+V2l8jbNA6bq2V1VMGdpbci/MbjrYoK5wemyucWt+cdq7KAPS4Gg05anzK+u7KqKd3eS0zWEm92ue0362aQAVYdLSRxtyxtDR5DfzJ5ld6Cv8A7I8PpaltVnnmezVgmexzWuGrXWDASRyuTbfexFgIiAiIgIiICIiAqy7W+0htAw01M4GpeNSP8Ahg8z+d0XHtR7Uo6FrqekIfUkWJ3bH5nqfJa41dS+V7pJXFz3ElzjqSSg4TSue4ucSXEkknck7lcERAREQEREBERAREQFOeH+AjUUzZS8iV5JbHYWycnF30TfX4KNcNYQ6rqY4W8zdx6NHtFX3QsDWiGlGjbB0h2FtLD6zvsCCpYa+swqTuZ2d5De5ZcgO6eIXI/ROitDgzjOOTxQSgvIGdr/AAsjb0ay+p8+fW2ikD+Dm1MZZJGCx25dufPqqs4y7Ia2jPfURdNGNbM/KN930h6INg8OxSOZoc0/HQ/Be5ao4R2gVlPIPlAMuTQB92ub/P1Vn8HdscDw2OqJa88yPCOgzfZqgt9F5cPr45254nBw8l6kBERAREQEREBF566uihaXzSNY0blxAH2qr+LO22khuyhaZ37Zto7/AHlBaFfXRQsMk0jWMGpc4gBUj2i9s+drqfC7gG4dORrba0Y5fpH3dVi6Xh7G8feJKt7oqe9xmBa235kfP1KzvaH2Y0tHhLnU7byxOD3PO7hs5BRkshcS5xJJNyTqSfVcERAREQEREBERAREQEREE/wCyrD2F0s8pOVoDA0buLtcvU6clc/DmHPlkBeMrQNIxs1vnbdx+xUnwTxdS0UJa6JxlJJz6EC+1h6KxeHu2HDII8r2zlxN3Oyg3PxQXG0W0C+qtW9t+E8zOP8L+a5Dtswj6837o/iglWP8AB1BWA/KKZjifpWs79oaqneKew6ojcX4fIJGcmPNnjyB2KnH+u3CPrTfuj+K+f67cI+tN+6/mgqPD5cewl3gjmYObSzOw+5TTAu3ZzLMxGkIP14tD6ljv4FSZ/bZg53Mx/wAL+axOI9pfDs4LZqZ7wesDfxQSak7XsGkH+8lh6PjkFvfa32r2t7TMHP8Az0fvuP4Kn8QrOE5TdsVVH+g2w+GZYqSm4ZO1RXD9RhQX3F2h4S7avgHq8D714sS7VMHhvera89IwX/aBZUkyk4Y51Nd+7YsjQHhJhu81cn6TSB/lKCY4n290jbinpZZPNxawfDUrASdreM1ZDKGjDc2gLWOkPxPhWbwjiXhSL8nC1p6viJPx1UoZ2pYHGLR1DQOjI3D+AQV1S9meNYk8SYnUFjTrZ7szgPJg0Csrhfstw2iIc2LvZB9OXxEeg2C8ru2TBx/xnn0jK4Htowj+8l/dn8UFhtaBoBYLB8c0ve4fVMte8T/sF/4KKntrwj6837o/iuir7Z8HexzC6azmub+S6i3VBrUi767J3j+7OZmY5SRYkX005LoQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf//Z"
);

// 底部圖片資料 (定義三組，手機版會自動隱藏最後一組)
const imgList = ref([
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOCxmFu8e5UtarR5p-TApZWjqRmNX65pnHYg&s",
    url: "連結1",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE88tdQXXidf2uGgjJYj2-EzhGMPHy1Efd3A&s",
    url: "連結2",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyER23g_RhNc8N66fo45XSH2WxgcE7cylSqA&s  ",
    url: "連結3",
  },
]);
</script>

<template>
  <div
    class="min-h-screen bg-[#FDF2F2] p-4 md:p-10 flex justify-center items-start font-sans"
  >
    <div
      class="w-full max-w-[360px] md:max-w-[768px] lg:max-w-[1024px] bg-[#FCE8E8] rounded-[50px] shadow-sm p-4 md:p-12"
    >
      <div class="w-full flex justify-center mb-6">
        <div
          class="w-[85%] md:w-3/4 bg-white rounded-lg py-2 md:py-3 shadow-sm relative text-center"
        >
          <span class="text-gray-700 font-bold text-base md:text-xl">{{
            statusMessage
          }}</span>
          <div
            class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"
          ></div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row items-stretch gap-4 md:gap-8 mb-8">
        <div
          class="flex flex-col items-center justify-between w-full md:w-[300px] lg:w-[350px]"
        >
          <div
            class="w-48 h-48 md:w-full md:h-auto md:aspect-square bg-white rounded-[40px] overflow-hidden shadow-sm"
          >
            <img :src="petAvatar" class="w-full h-full object-cover" />
          </div>
          <div class="flex gap-4 text-white text-2xl py-2">
            <span>★</span><span>⬅</span><span>●</span><span>✿</span
            ><span>斜</span>
          </div>
          <div
            class="bg-white px-6 py-1 rounded-md text-xs font-black text-gray-500 shadow-sm"
          >
            追蹤數 {{ followerCount }}
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-3 mt-4 md:mt-0">
          <div
            class="bg-white p-2 md:p-5 rounded-xl text-center text-base font-bold text-gray-700 shadow-sm"
          >
            <!-- 顯示註冊時選擇的標籤 -->
            滑稽、搞笑、無語、歡樂、療癒、可愛
          </div>
          <div
            class="h-32 md:flex-1 bg-white rounded-[30px] flex items-center justify-center text-gray-500 font-black text-xl shadow-sm border-2 border-dashed border-pink-50"
          >
            <!-- 收藏/追蹤活動 -->
            金星搞笑大賽第十屆
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          class="w-full h-14 md:h-24 bg-white rounded-[20px] md:rounded-[40px] shadow-sm flex items-center justify-center relative"
        >
          <div
            class="absolute -top-3 left-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <div
            class="absolute -top-3 right-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <span class="text-lg md:text-2xl font-black text-gray-800">
            <!-- text -->
            為甚麼上次沒得獎
          </span>
        </div>
        <div
          class="w-full h-14 md:h-24 bg-white rounded-[20px] md:rounded-[40px] shadow-sm flex items-center justify-center relative"
        >
          <div
            class="absolute -top-3 left-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <div
            class="absolute -top-3 right-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <span class="text-lg md:text-2xl font-black text-gray-800">
            <!-- text -->
            天理不公
          </span>
        </div>
        <div
          class="hidden md:flex w-full h-24 bg-white rounded-[40px] shadow-sm items-center justify-center relative"
        >
          <div
            class="absolute -top-3 left-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <div
            class="absolute -top-3 right-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <span class="text-2xl font-black text-gray-800">
            <!-- text -->
            這次肯定第一名
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
        <a
          v-for="(img, index) in imgList"
          :key="'img-' + index"
          :href="img.url"
          target="_blank"
          :class="[
            'aspect-square bg-white rounded-[25px] md:rounded-[45px] shadow-sm overflow-hidden hover:scale-105 transition-all border-4 border-white hover:border-[#FFC2D1] flex items-center justify-center',
            index === 2 ? 'hidden md:flex' : 'flex',
          ]"
        >
          <img :src="img.src" class="w-full h-full object-cover" />
          <span
            v-if="!img.src"
            class="text-xl md:text-3xl font-black text-gray-300"
            >img</span
          >
        </a>
      </div>
    </div>
  </div>
</template>
