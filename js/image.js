/**
 * 压缩图片方法
 * @param {file} file 文件
 * @param {Number} quality 图片质量(取值0-1之间默认0.92)
 */
function compressImg(file, quality) {
  var qualitys = 0.52
  console.log(parseInt((file.size / 1024).toFixed(2)))
  if (parseInt((file.size / 1024).toFixed(2)) < 1024) {
    qualitys = 0.85
  }
  if (5 * 1024 < parseInt((file.size / 1024).toFixed(2))) {
    qualitys = 0.92
  }
  if (quality) {
    qualitys = quality
  }
  if (file[0]) {
    return Promise.all(Array.from(file).map(e => this.compressImg(e, qualitys))) // 如果是 file 数组返回 Promise 数组
  } else {
    return new Promise(resolve => {
      console.log(file)
      if ((file.size / 1024).toFixed(2) < 300) {
        resolve({
          file: file
        })
      } else {
        const reader = new FileReader() // 创建 FileReader
        reader.onload = ({ target: { result: src } }) => {
          const image = new Image() // 创建 img 元素
          image.onload = async () => {
            const canvas = document.createElement('canvas') // 创建 canvas 元素
            const context = canvas.getContext('2d')
            var targetWidth = image.width
            var targetHeight = image.height
            var originWidth = image.width
            var originHeight = image.height
            if (
              1 * 1024 <= parseInt((file.size / 1024).toFixed(2)) &&
              parseInt((file.size / 1024).toFixed(2)) <= 10 * 1024
            ) {
              var maxWidth = 1600
              var maxHeight = 1600
              targetWidth = originWidth
              targetHeight = originHeight
              // 图片尺寸超过的限制
              if (originWidth > maxWidth || originHeight > maxHeight) {
                if (originWidth / originHeight > maxWidth / maxHeight) {
                  // 更宽，按照宽度限定尺寸
                  targetWidth = maxWidth
                  targetHeight = Math.round(
                    maxWidth * (originHeight / originWidth)
                  )
                } else {
                  targetHeight = maxHeight
                  targetWidth = Math.round(
                    maxHeight * (originWidth / originHeight)
                  )
                }
              }
            }
            if (
              10 * 1024 <= parseInt((file.size / 1024).toFixed(2)) &&
              parseInt((file.size / 1024).toFixed(2)) <= 20 * 1024
            ) {
              maxWidth = 1400
              maxHeight = 1400
              targetWidth = originWidth
              targetHeight = originHeight
              // 图片尺寸超过的限制
              if (originWidth > maxWidth || originHeight > maxHeight) {
                if (originWidth / originHeight > maxWidth / maxHeight) {
                  // 更宽，按照宽度限定尺寸
                  targetWidth = maxWidth
                  targetHeight = Math.round(
                    maxWidth * (originHeight / originWidth)
                  )
                } else {
                  targetHeight = maxHeight
                  targetWidth = Math.round(
                    maxHeight * (originWidth / originHeight)
                  )
                }
              }
            }
            canvas.width = targetWidth
            canvas.height = targetHeight
            context.clearRect(0, 0, targetWidth, targetHeight)
            context.drawImage(image, 0, 0, targetWidth, targetHeight) // 绘制 canvas
            const canvasURL = canvas.toDataURL('image/jpeg', qualitys)
            const buffer = atob(canvasURL.split(',')[1])
            let length = buffer.length
            const bufferArray = new Uint8Array(new ArrayBuffer(length))
            while (length--) {
              bufferArray[length] = buffer.charCodeAt(length)
            }
            const miniFile = new File([bufferArray], file.name, {
              type: 'image/jpeg'
            })
            console.log({
              file: miniFile,
              origin: file,
              beforeSrc: src,
              afterSrc: canvasURL,
              beforeKB: Number((file.size / 1024).toFixed(2)),
              afterKB: Number((miniFile.size / 1024).toFixed(2)),
              qualitys: qualitys
            })
            resolve({
              file: miniFile,
              origin: file,
              beforeSrc: src,
              afterSrc: canvasURL,
              beforeKB: Number((file.size / 1024).toFixed(2)),
              afterKB: Number((miniFile.size / 1024).toFixed(2))
            })
          }
          image.src = src
        }
        reader.readAsDataURL(file)
      }
    })
  }
}
