const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById('photo-preview')
let image
let ImageName

// Clicando no input de carregamento do arquivo pela tag de button
document.getElementById('select-image').onclick = function () {
    photoFile.click()   
}

// Concluindo o carregamento da DOM
window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        // Pegando um arquivo carregado
        let file = photoFile.files.item(0)
        ImageName = file.name

        // Lendo um arquivo
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function (event) {
            image = new Image()
            image.src = event.target.result
            image.onload = onLoadImage
        }
    })
})

// Construindo a funcionalidade da Selection-tool
const selection = document.getElementById('selection-tool')
let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY
let startSelection = false

// Setando os evendo do mouse
const events = {
    mouseover(){
        this.style.cursor = 'crosshair'
    },
    mousedown(){
        const {clientX, clientY, offsetX, offsetY} = event
        // console.table({
        //     'client': [clientX, clientY],
        //     'offset': [offsetX, offsetY]
        // })

        startX = clientX
        startY = clientY
        relativeStartX = offsetX
        relativeStartY = offsetY
        startSelection = true
    },
    mousemove(event){
        endX = event.clientX
        endY = event.clientY

        if(startSelection) {
            selection.style.display = 'initial'
            selection.style.top = startY + 'px'
            selection.style.left = startX + 'px'

            selection.style.width = (endX - startX) + 'px'
            selection.style.height = (endY - startY) + 'px'
        }

        
    },
    mouseup(event){
        startSelection = false

        relativeEndX = event.layerX
        relativeEndY = event.layerY

        // Mostrando o botão de cortar imagem
        cropButton.style.display = 'initial'
    }
}

Object.keys(events).forEach((eventName) => {
    photoPreview.addEventListener(eventName, events[eventName])
})


// Canvas
let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

function onLoadImage() {
    const {width, height} = image
    canvas.width = width
    canvas.height = height

    // Limpar o contexto
    ctx.clearRect(0, 0, width, height)

    // Desenhar a imagem no contexto
    ctx.drawImage(image, 0, 0)

    // Atualizando o preview da image
    photoPreview.src = canvas.toDataURL()
}

// Cortar imagem
const cropButton = document.getElementById('crop-image') // botão de cortar imagem
cropButton.onclick = () => {
    const {width: imgW, height: imgH} = image // Isso é uma desestruturação cujas variaveis serão nomeadas de outra forma
    const {width: previewW, height: previewH} = photoPreview

    const [widthFactor, heightFactor] = [
        +(imgW / previewW),
        +(imgH / previewH)
    ]
        
    

    const [selectionWidth, selectionHeight] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]
        
    

    const [croppedWidth, croppedHeight] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]
        
    

    const [actualX, actualY] = [
        +(relativeStartX * widthFactor),
        +(relativeStartY * heightFactor)
    ]

    // Pegar do ctx a imagem cortada
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    // Limpar o contexto do canvas (ctx)
    ctx.clearRect(0, 0, ctx.width, ctx.height)

    // Ajuste de proporções
    image.width = canvas.width = croppedWidth
    image.height = canvas.height = croppedHeight

    // Adicionar a imagem cortada ao contexto do canvas
    ctx.putImageData(croppedImage, 0, 0)

    // Esconder a ferramenta de seleção
    selection.style.display = 'none'

    // Atualizar o photo-preview da imagem
    photoPreview.src = canvas.toDataURL()

    // Mostrar o botão de download
    donwloadButton.style.display = 'initial'
}

// Download
const donwloadButton = document.getElementById('download')
donwloadButton.onclick = () => {
    const a = document.createElement('a')
    a.download = ImageName + '-cropped.png'
    a.href = canvas.toDataURL()
    a.click()
}
