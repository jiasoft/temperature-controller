<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

type Props = {
  
  value: number;
  width:number;
  height:number;
  minimum?: number;
  maximum?: number;
  unit?: string;
};
interface Emits {
  (
    e: "change",
    value: {
      value: number;
    }
  ): void;
}
const props = defineProps<Props>();
const minRotate = -41;
const maxRotate = 220;
const step = 0.5;
const minTemperature = props.minimum || 16; //minimum
const maxTemperature = props.maximum || 35; //maximum
const wrapper = ref();
const wrapperView = ref();
const emit = defineEmits<Emits>();
/**
 * 温度转成角度
 * @param valTemperature 温度
 */
const temToRotate = (valTemperature: number): number => {
  const temPer =
    (valTemperature - minTemperature) / (maxTemperature - minTemperature);
  const rotateNum = minRotate + (maxRotate - minRotate) * temPer;
  return rotateNum;
};
/**
 * 角度转面温度
 * @param valRotate 角度
 */
const rotateToTempareture = (valRotate: number): number => {
  const rotatePer = (valRotate - minRotate) / (maxRotate - minRotate);
  let temperature =
    minTemperature + (maxTemperature - minTemperature) * rotatePer;
  temperature = Math.round(temperature * 10) / 10;
  return temperature;
};
//转成给canvas的度数
const toTateToPercent = (rotate: number) => {
  return (rotate / 360) * (Math.PI * 2);
};
const curValue = ref<number>(props.value || 20);
const curRotate = ref<number>(temToRotate(curValue.value)); //当前角度
const outvalue = ref<number>(props.value || 20);

/** 中心点 */
const center = {
  x: props.width / 2,
  y: props.height / 2,
};
const handleValueChange = (val: number) => {
  emit("change", {value: val });
};
const calcOpposite = (x: number, y: number): number => {
  return Math.pow(Math.pow(center.y - y, 2) + Math.pow(center.x - x, 2), 1 / 2);
};

//计算Rotate
const calcRotate = (
  x: number,
  y: number,
  centerX: number,
  centerY: number
): number => {
  const atan2 = Math.atan2(centerY - y, centerX - x);
  let rotate = (atan2 / Math.PI) * 180;
  if (rotate < -140) {
    rotate = 360 + rotate;
  }
  return rotate;
};

/** 移动指釧 */
const movePoint = (x: number, y: number) => {
  let rotate = calcRotate(x, y, center.x, center.y);
  if (rotate <= -42) {
    return;
  }
  rotate = findNearRotate(rotate);
  curRotate.value = rotate;
};

/**根据步长获取刻度list */
const getwRotateListByStep = (): number[] => {
  const startRotate = temToRotate(minTemperature);
  const endRotate = temToRotate(maxTemperature);
  let rotate = temToRotate(minTemperature);
  let temperature = minTemperature;
  const list = [];
  list.push(startRotate);
  while ((rotate = temToRotate((temperature += step))) && rotate < endRotate) {
    list.push(rotate);
  }
  list.push(endRotate);
  return list;
};
/**找到最近的rotate */
const findNearRotate = (rotate: number): number => {
  const list = getwRotateListByStep();
  let near = 99999999999;
  let curRotate: number = rotate;
  for (let i = 0; i < list.length; i++) {
    if (near > Math.abs(list[i] - rotate)) {
      near = Math.abs(list[i] - rotate);
      curRotate = list[i];
    }
  }
  return curRotate;
};
const radius = (props.width) / 2; //半径
/**
 * 画刻度
 */
const drawDial = () => {
  const c2d = wrapperView.value.getContext("2d");
  c2d.translate(radius, radius);
  drawArc(c2d);
  const list = getwRotateListByStep();
  for (let i = 0; i < list.length; i++) {
    drawLine(c2d, list[i]);
  }
};
/** 刻度里面的线条 */
const drawLine = (c2d: any, rotate: number) => {
  const r: number = toTateToPercent(rotate);
  c2d.save();
  c2d.beginPath();
  c2d.lineWidth = 3;
  c2d.globalAlpha = 0.7;
  c2d.strokeStyle = "#1bbef6";
  c2d.rotate(r);
  c2d.moveTo(-radius, 0);
  c2d.lineTo(-radius + 18, 0);
  c2d.stroke();
  c2d.closePath();
  c2d.restore();
};
const drawArc = (c2d: any) => {
  c2d.save();
  c2d.beginPath();
  c2d.lineWidth = 20;
  c2d.strokeStyle = "#f5faff";
  c2d.arc(0, 0, radius - 20, 0, Math.PI * 2);
  c2d.stroke();
  c2d.closePath();
  c2d.restore();

  c2d.save();
  c2d.beginPath();
  c2d.lineWidth = 3;
  c2d.strokeStyle = "#f9fbfd";
  c2d.arc(0, 0, radius - 30, 0, Math.PI * 2);
  c2d.stroke();
  c2d.closePath();
  c2d.restore();
};
const mousedown = (ex: any) => {
  const rect = wrapper.value.getBoundingClientRect();
  const { clientX, clientY } = ex;
  const x = clientX - rect.x;
  const y = clientY - rect.y;
  const mouseomve = (ex: any) => {
    const { clientX, clientY } = ex;
    const x = clientX - rect.x;
    const y = clientY - rect.y;
    movePoint(x, y);
    curValue.value = rotateToTempareture(curRotate.value);
  };
  movePoint(x, y);
  window.addEventListener("mousemove", mouseomve);
  window.addEventListener("mouseup", function mouseup() {
    curValue.value = rotateToTempareture(curRotate.value);
    outvalue.value = curValue.value;
    window.removeEventListener("mousemove", mouseomve);
    window.removeEventListener("mousemove", mouseup);
  });
};

const touchstart = (ex: any) => {
  const rect = wrapper.value.getBoundingClientRect();
  const { targetTouches } = ex;
  const [Touch] = targetTouches;
  const { clientX, clientY } = Touch;
  const x = clientX - rect.x;
  const y = clientY - rect.y;
  movePoint(x, y);
};

const touchmove = (ex: any) => {
  const rect = wrapper.value.getBoundingClientRect();
  const { targetTouches } = ex;
  const [Touch] = targetTouches;
  const { clientX, clientY } = Touch;
  const x = clientX - rect.x;
  const y = clientY - rect.y;
  movePoint(x, y);
  curValue.value = rotateToTempareture(curRotate.value);
};
const touchend = () => {
  curValue.value = rotateToTempareture(curRotate.value);
  outvalue.value = curValue.value;
};
onMounted(() => {
  watch(
    () => outvalue.value,
    () => {
      handleValueChange(curValue.value);
    }
  );
  watch(
    () => curValue.value,
    () => {
      curRotate.value = temToRotate(curValue.value);
    }
  );
  watch(
    () => props.value,
    () => {
      curValue.value = props.value;
      curRotate.value = temToRotate(props.value);
    }
  );
  drawDial();

  ///////// 鼠标事件 /////////////////
  wrapper.value.addEventListener("mousedown", mousedown);

  //////////手指触碰事件//////////
  wrapper.value.addEventListener("touchstart", touchstart);
  wrapper.value.addEventListener("touchmove", touchmove);
  wrapper.value.addEventListener("touchend", touchend);
});
onUnmounted(() => {
  wrapper.value.removeEventListener("mousedown", mousedown);
  wrapper.value.removeEventListener("touchstart", touchstart);
  wrapper.value.removeEventListener("touchmove", touchmove);
  wrapper.value.removeEventListener("touchend", touchend);
});
</script>

<template>
  <div
    class="wrapper-bar"
    onselectstart="return false;"
    ref="wrapper"
    :style="'width:'+ width+'px;height:'+ height+'px'"
  > 
    <canvas
      class="wrapper-view"
      ref="wrapperView"
      :width="width"
      :height="height"
    ></canvas>
    <div class="set-data">
      <span class="num">{{ curValue.toString().split(".")[0] }}</span>
      <div class="sm-nm-ut">
        <span class="until">{{ unit || "℃" }}</span>
        <span class="sm-num"
          >.{{ curValue.toString().split(".")[1] || 0 }}</span
        >
      </div>
    </div>
    <!-- <div class="center-point"></div> -->
    <i class="icon-point" :style="'transform: rotate(' + curRotate + 'deg)'">
      <svg
        width="40"
        height="40"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_1_16)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15 17C11.6862 17 9 14.3138 9 11C9 7.68624 11.6862 5 15 5C18.3138 5 21 7.68624 21 11C21 14.3138 18.3138 17 15 17Z"
            fill="#1BBEF6"
          />
          <path
            d="M9 11C9 14.3138 11.6862 17 15 17C18.3138 17 21 14.3138 21 11C21 7.68624 18.3138 5 15 5C11.6862 5 9 7.68624 9 11Z"
            stroke="white"
            stroke-width="3"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1_16"
            x="0.5"
            y="0.5"
            width="29"
            height="29"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3.5" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0745098 0 0 0 0 0.227451 0 0 0 0 0.317647 0 0 0 0.5 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1_16"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1_16"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </i>
    <div class="min-temperature">
      {{ minTemperature }}
    </div>
    <div class="max-temperature">
      {{ maxTemperature }}
    </div>
  </div>
</template>

<style scoped>
.wrapper-bar {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%,-50%);
}
.wrapper-view {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.icon-point {
  position: absolute;
  width: 85%;
  height: 1px;
  display: flex;
  align-items: center;
  transform: rotate(0deg);
  transition: transform 0.3s;
}
.icon-point > svg {
  position: absolute;
  margin-top: 10px;
}
.center-point {
  width: 5px;
  height: 5px;
  opacity: 1;
  background-color: #d5d6d6;
  position: absolute;
  border-radius: 50%;
}

.set-data {
  width: 100%;
  font-size: 23px;
  text-align: center;
  font-family: cursive;
  display: flex;
  justify-content: center;
  align-items: center;
}
.set-data .num {
  margin-right: 0px;
  font-size: 36px;
}
.sm-nm-ut {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.min-temperature,
.max-temperature {
  position: absolute;
  left: 10%;
  top: 85%;
}
.max-temperature {
  left: auto;
  right: 10%;
}
</style>
